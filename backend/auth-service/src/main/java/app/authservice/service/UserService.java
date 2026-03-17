package app.authservice.service;

import app.authservice.dto.UserLoginRequestDto;
import app.authservice.dto.UserRegisterRequestDto;
import app.authservice.dto.UserResponseDto;
import app.authservice.repository.UserRepository;

public class UserService {
    private final UserRepository userRepository;
    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }
    public UserResponseDto Login(UserRegisterRequestDto request){

    }


}
