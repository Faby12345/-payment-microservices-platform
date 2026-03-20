package app.authservice.service;

import app.authservice.entity.Role;
import app.authservice.entity.User;
import app.authservice.mapper.UserMapper;
import app.authservice.repository.RoleRepository;
import app.authservice.repository.UserRepository;
import app.authservice.web.dto.request.UserLoginRequestDto;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.UserResponseDto;
import app.authservice.web.exception.EmailAlreadyExistsException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Slf4j
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
        log.info("Attempting to register new user with email: {}", dto.email());

        if (userRepository.existsByEmail(dto.email())) {
            log.warn("Registration failed: Email {} is already taken", dto.email());
            throw new EmailAlreadyExistsException("Email is already taken");
        }

        String passwordHash = passwordEncoder.encode(dto.password());


        /**
         * When we add a role for user, it will automatically insert into
         * user_role table a new role for the user (CHECK USER ENTITY CLASS
         * - the roles field annotaion)
         */
        Set<Role> userRoles = new HashSet<>();
        Role role = roleService.findRoleByName("USER");
        userRoles.add(role);

        User newUser = userMapper.toEntity(dto, passwordHash);
        newUser.setRoles(userRoles);


        try{
            User savedUser = userRepository.save(newUser);
            log.info("feat(auth-service-REGISTER ): User with id: {}, name: {} created SUCCESFULLY",
                    savedUser.getId(),
                    savedUser.getFirstName() + " " + newUser.getLastName());
            return userMapper.toResponse(savedUser);

        } catch (DataIntegrityViolationException e) {
            // Safe-guard against race conditions
            log.error("Critical Race Condition: Duplicate email detected during DB insert for {}", dto.email());
            throw new EmailAlreadyExistsException("Email is already registered");
        }


    }


    public UserResponseDto login(UserLoginRequestDto dto){
        log.info("User with email: {} trys to login", dto.email());
        if(!userRepository.existsByEmail(dto.email())){
            log.warn("User with email: {} DON'T EXISTS", dto.email());
        }
        //String passwordHash =  passwordEncoder.encode(dto.password());
        return null;
    }




}
