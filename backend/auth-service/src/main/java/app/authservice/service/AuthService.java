package app.authservice.service;

import app.authservice.entity.RefreshToken;
import app.authservice.entity.Role;
import app.authservice.entity.User;
import app.authservice.mapper.UserMapper;
import app.authservice.repository.RoleRepository;
import app.authservice.repository.UserRepository;
import app.authservice.security.JwtProperties;
import app.authservice.security.JwtService;
import app.authservice.web.dto.request.UserLoginRequestDto;
import app.authservice.web.dto.request.UserRegisterRequestDto;
import app.authservice.web.dto.response.TokenResponseDto;
import app.authservice.web.dto.response.UserResponseDto;
import app.authservice.web.exception.EmailAlreadyExistsException;
//import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final RoleService roleService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;





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
                    savedUser.getFirstName() + " " + savedUser.getLastName());
            return userMapper.toResponse(savedUser);

        } catch (DataIntegrityViolationException e) {
            // Safe-guard against race conditions
            log.error("Critical Race Condition: Duplicate email detected during DB insert for {}", dto.email());
            throw new EmailAlreadyExistsException("Email is already registered");
        }


    }


    public TokenResponseDto login(UserLoginRequestDto dto){
        log.info("User with email: {} trys to login", dto.email());

        Authentication authenticationRequest = UsernamePasswordAuthenticationToken
                .unauthenticated(dto.email(), dto.password());

        /**
         * this automatically throws exception (BadCredentialsException)
         * and stop execution if the user / passwrod is wrong
         * it compers the passwrod hashes. etc (all the logic)
         * */
        Authentication authenticationResponse =
                this.authenticationManager.authenticate(authenticationRequest);

        // ( .orElseThrow() just in case, though the auth manager already proved they exist).
        User user = userRepository.findByEmail(dto.email())
                .orElseThrow(() -> new RuntimeException("User not found"));


        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String accessToken = jwtService.generateToken(user);

        return new TokenResponseDto(accessToken, refreshToken.getToken());
    }


    /**
     * Because in RefreshEntityToken we have: @ManyToOne(fetch = FetchType.LAZY)
     * when we will try: token.getUser(); it will recive a LazyInitializationException,
     * so in order to not recive that, @Transactional(readOnly = true) prevents that
     * (the db connection stays open after findByToken is called)
     * */
    @Transactional(readOnly = true)
    public TokenResponseDto generateAccessToken(String refreshToken){
        RefreshToken token = refreshTokenService.findByToken(refreshToken);
        token = refreshTokenService.verifyExpirationAndStatus(token);
        User user = token.getUser();
        String accessToken = jwtService.generateToken(user);
        return new TokenResponseDto(accessToken, refreshToken);
    }

    public void logout(String refreshToken){
        refreshTokenService.deleteByToken(refreshToken);
        log.info("User with refresh token: {} logged out", refreshToken);
    }




}
