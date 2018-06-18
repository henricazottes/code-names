module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "no-trailing-spaces": [
            "error"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-console": "off"
    },
    "parserOptions":{
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        },
        "sourceType": "module"
    },
    "globals": {
        "$": true,
        "io": true
    }
};