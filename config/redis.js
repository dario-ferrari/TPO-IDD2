module.exports = {
    redis: {
        host: 'localhost',
        port: 6379,
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000);
        }
    }
}; 