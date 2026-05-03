package com.laioffer.onlineorder.controller;

import com.laioffer.onlineorder.service.ImageProxyService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Duration;


@RestController
public class ImageController {

    private final ImageProxyService imageProxyService;


    public ImageController(ImageProxyService imageProxyService) {
        this.imageProxyService = imageProxyService;
    }


    @GetMapping("/images/proxy")
    public ResponseEntity<byte[]> proxyImage(@RequestParam("url") String url) {
        try {
            ImageProxyService.ImageResponse image = imageProxyService.fetchImage(url);
            return ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(Duration.ofHours(6)).cachePublic())
                    .header(HttpHeaders.CONTENT_TYPE, image.contentType())
                    .body(image.body());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image URL", e);
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to fetch image", e);
        }
    }
}
