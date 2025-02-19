'use strict'

module.exports = {
    key_separator: "_",
    ttl: 3600, // In seconds
    ro: {
        string_connect: {url: "redis://127.0.0.1:6379"}
    },
    rw: {
        string_connect: {url: "redis://127.0.0.1:6379"}
    },
    cart_ttl: 3600

    /*
    key_separator: "_",
    ttl: 120, // In seconds
    ro: {
        string_connect: {url: "redis://10.80.12.241:8102"}
    },
    rw: {
        string_connect: {url: "redis://10.80.12.241:8102"}
    }
    */
}