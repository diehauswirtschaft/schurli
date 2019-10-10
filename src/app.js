const config = require("./config");
const matomo = require("./controllers/matomo");
const firestore = require("./controllers/firestore");

const express = require("express");
const { param, validationResult } = require("express-validator");

const app = express();

// configure express to be less noisy
app.set("etag", false); // we don't need etags ...
app.set("x-powered-by", false); // nobody needs this header

// security headers
app.use((req, res, next) => {
    if (process.env.NODE_ENV === "production") {
        // HSTS incl. preload to enforce secure https requests by default
        res.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

        // no sniffing for mime types
        res.header("X-Content-Type-Options", "nosniff");
    }

    next();
});

function getQuery(originalURL) {
    return originalURL.indexOf("?") >= 0
        ? originalURL.substr(originalURL.indexOf("?") + 1)
        : "";
}

app.get(["/", "/s/"], (req, res) => {
    const fullURL = config.get("baseURL") + "/";

    try {
        matomo.trackVisit(
            "",
            fullURL,
            req.headers["user-agent"] || "",
            req.headers["referer"] || "",
            getQuery(req.originalUrl)
        );

        return res.redirect(302, fullURL);
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error.");
    }
});

/**
 * Redirects a short URL to the full version.
 */
app.get("/s/:slug", [
    param("slug").isByteLength({ min: 1, max: 200 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send("Invalid short URL!");
    }

    const slug = req.params.slug;

    try {
        const fullURL = await firestore.getFullURL(slug);

        if (fullURL === null) {
            return res.status(404).send("Not found.");
        } else {
            matomo.trackVisit(
                slug,
                fullURL,
                req.headers["user-agent"] || "",
                req.headers["referer"] || "",
                getQuery(req.originalUrl)
            );

            return res.redirect(302, fullURL);
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error.");
    }
});

module.exports = app;
