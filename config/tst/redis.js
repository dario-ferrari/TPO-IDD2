'use strict'

module.exports = {
    key_separator: "_",
    ttl: 120, // In seconds
    ro: {
        string_connect: {url: "redis://127.0.0.1:6379"}
    },
    rw: {
        string_connect: {url: "redis://127.0.0.1:6379"}
    }
}