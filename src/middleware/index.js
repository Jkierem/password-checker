import { Try } from '@juan-utils/ramda-structures'

const getURL = (pass) => `https://api.pwnedpasswords.com/range/${pass.slice(0,5)}`;

export const lookUp = (password) => {
    return Try.fromAsync(fetch(getURL(password)))
}