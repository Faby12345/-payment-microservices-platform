package app.authservice.service;

import app.authservice.entity.Role;
import app.authservice.entity.User;
import app.authservice.mapper.UserMapper;
import app.authservice.repository.RoleRepository;
import app.authservice.repository.UserRepository;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.UserResponseDto;
import app.authservice.web.exception.EmailAlreadyExistsException;
import jakarta.transaction.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RoleService roleService;
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper,
                       RoleService roleService)
    {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.roleService = roleService;
    }


    @Transactional
    public UserResponseDto register(UserRegisterRequestDto dto){

        if (userRepository.existsByEmail(dto.email())) {
            throw new EmailAlreadyExistsException("Email is already taken");
        }

        String passwordHash = passwordEncoder.encode(dto.password());
        Role role = roleService.findRoleByName("USER");
        /**
         * When we add a role for user, it will automatically insert into
         * user_role table a new role for the user (CHECK USER ENTITY CLASS
         * - the roles field annotaion)
         */

        Set<Role> userRoles = new HashSet<>();
        userRoles.add(role);
        User newUser = userMapper.toEntity(dto, passwordHash);
        newUser.setRoles(userRoles);


        try{
            User savedUser = userRepository.save(newUser);
            return userMapper.toResponse(savedUser);

        } catch (DataIntegrityViolationException e) {
            // Safe-guard against race conditions
            throw new EmailAlreadyExistsException("Email is already registered");
        }


    }


}
