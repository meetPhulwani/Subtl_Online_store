module.exports = {
    user: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    },
    owner: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    },
};
