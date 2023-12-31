package com.fire4bird.oz.error;

import com.fire4bird.oz.common.CMRespDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class ExceptionController {
    //서비스 로직에서 발생한 예외 잡아서 가공 후 return
    @ExceptionHandler
    public ResponseEntity businessLogicException(BusinessLogicException e) {

        return ErrorResponse.setErrorResponse(e.getExceptionCode());
    }

    //ExceptionCode enum에 작성되지 않은 에러가 발생된 경우 해당 핸들러가 잡아서 가공 후 return
    @ExceptionHandler(Exception.class)
    public ResponseEntity globalException(Exception e) {
        return ResponseEntity.status(500).body(e.getMessage());
    }

    //유효성 검사 실패 시 return
    @ExceptionHandler(CustomValidationApiException.class)
    public ResponseEntity<?> validationApiException(CustomValidationApiException e) {
        return new ResponseEntity<>(new CMRespDto<>(-1, e.getMessage(), e.getErrorMap()), HttpStatus.BAD_REQUEST);
    }

}
