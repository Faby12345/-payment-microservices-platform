package app.authservice.service;

import app.authservice.entity.User;
import app.authservice.mapper.UserMapper;
import app.authservice.repository.RoleRepository;
import app.authservice.repository.UserRepository;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.UserResponseDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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


    public UserResponseDto register(UserRegisterRequestDto dto){
        String passwordHash = passwordEncoder.encode(dto.password());
        try{
            User newUser = userMapper.toEntity(dto, passwordHash);
        }


    }


}
