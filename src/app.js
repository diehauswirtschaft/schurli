const config = require("./config");
const matomo = require("./controllers/matomo");
const firestore = require("./controllers/firestore");

const express = require("express");
const cookieParser = require("cookie-parser");
const { param, validationResult } = require("express-validator");

const app = express();

// configure express to be less noisy
app.set("etag", false); // we don't need etags ...
app.set("x-powered-by", false); // nobody needs this header

// for the ignore cookie
app.use(cookieParser());

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

/**
 * Extracts the query string to perform some campaign monitoring.
 * @param {string} originalURL the original request URL
 * @return {string} only the query part without ?
 */
function getQuery(originalURL) {
    return originalURL.indexOf("?") >= 0
        ? originalURL
            .substr(originalURL.indexOf("?") + 1)
            .replace(/&?fbclid=[^&]+/i, "") // strips facebook tracking stuff
        : "";
}

/**
 * A handler for the base URLs and the /s URL. Redirects to the configured base URL.
 */
app.get(["/", "/s/"], (req, res) => {
    const ignore = req.cookies && req.cookies.ignore;
    const fullURL = config.get("baseURL") + "/";

    try {
        if (!ignore) {
            matomo.trackVisit(
                "",
                fullURL,
                req.headers["user-agent"] || "",
                req.headers["referer"] || "",
                getQuery(req.originalUrl)
            );
        }

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
    const ignore = req.cookies && req.cookies.ignore;
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
            if (!ignore) {
                matomo.trackVisit(
                    slug,
                    fullURL,
                    req.headers["user-agent"] || "",
                    req.headers["referer"] || "",
                    getQuery(req.originalUrl)
                );
            }

            return res.redirect(302, fullURL);
        }
    } catch (e) {
        console.error(e);
        return res.status(500).send("Internal Server Error.");
    }
});

/**
 * Sets a cookie which will ignore incoming requests for tracking,
 * but will redirect them as well.
 */
app.get(["/ignore"], (req, res) => {
    res.cookie("ignore", "true", {
        domain: config.get("cookie:domain"),
        maxAge: config.get("cookie:maxAge"),
        secure: false
    });

    res.status(200).send("\uD83C\uDF6A Cookie set \u2705");
});

/**
 * Deletes the ignore cookie.
 */
app.get(["/count"], (req, res) => {
    res.clearCookie("ignore", {
        domain: config.get("cookie:domain"),
        maxAge: config.get("cookie:maxAge"),
        secure: false
    });

    res.status(200).send("\uD83C\uDF6A Cookie deleted \u274C");
});

module.exports = app;
