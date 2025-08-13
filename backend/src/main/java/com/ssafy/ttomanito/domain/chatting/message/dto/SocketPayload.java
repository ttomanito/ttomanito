package com.ssafy.ttomanito.domain.chatting.message.dto;

public record SocketPayload<T>(String type, T data) {}
