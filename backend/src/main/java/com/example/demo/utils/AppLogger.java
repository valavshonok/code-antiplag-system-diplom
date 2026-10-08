package com.example.demo.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AppLogger {

    private static final Logger log = LoggerFactory.getLogger("APP");

    // ANSI цвета
    private static final String RESET = "\u001B[0m";
    private static final String GREEN = "\u001B[32m";
    private static final String RED = "\u001B[31m";
    private static final String YELLOW = "\u001B[33m";
    private static final String BLUE = "\u001B[34m";

    private AppLogger() {
    }

    // ---------- INFO ----------
    public static void info(String message) {
        log.info(message);
    }

    public static void success(String message) {
        log.info(GREEN + message + RESET);
    }

    // ---------- WARN ----------
    public static void warn(String message) {
        log.warn(YELLOW + message + RESET);
    }

    // ---------- ERROR ----------
    public static void error(String message) {
        log.error(RED + message + RESET);
    }

    public static void error(String message, Throwable t) {
        log.error(RED + message + RESET, t);
    }

    // ---------- DEBUG ----------
    public static void debug(String message) {
        log.debug(BLUE + message + RESET);
    }
}
