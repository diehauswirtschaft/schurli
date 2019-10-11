const config = require("../config");

const MatomoTracker = require("matomo-tracker");

const matomo = new MatomoTracker(config.get("matomo:site"), config.get("matomo:url"));
matomo.on("error", function(err) {
    console.error(`Matomo error: ${err}`);
});

/**
 * Tracks a visit to the configured Matomo tracker.
 *
 * @param {string} slug short slug
 * @param {string} fullURL redirect URL
 * @param {string} userAgent optional user agent
 * @param {string} referrer optional user referrer
 * @param {string} query optional query to associate the visit with a campaign
 */
exports.trackVisit = function trackVisit(slug, fullURL, userAgent, referrer, query) {
    matomo.track({
        url: `${config.get("baseURL")}/s/${slug}`,
        action_name: "Unshorten",
        ua: userAgent || "",
        urlref: referrer || "",
        cvar: JSON.stringify({
            "1": ["fullURL", fullURL],
            "2": ["slug", slug],
            "3": ["query", query || ""]
        })
    });
};
