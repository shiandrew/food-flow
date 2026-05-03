package com.laioffer.onlineorder.service;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;


@Service
public class ImageProxyService {

    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();


    public ImageResponse fetchImage(String url) throws IOException, InterruptedException {
        URI uri = URI.create(url);
        String scheme = uri.getScheme();
        if (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme)) {
            throw new IllegalArgumentException("Unsupported image URL scheme");
        }

        HttpRequest request = HttpRequest.newBuilder(uri)
                .header("User-Agent", "FoodFlow Image Proxy")
                .GET()
                .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new IOException("Failed to fetch image. Status: " + response.statusCode());
        }

        String contentType = response.headers()
                .firstValue("Content-Type")
                .orElse("application/octet-stream");
        return new ImageResponse(response.body(), contentType);
    }


    public record ImageResponse(byte[] body, String contentType) {
    }
}
