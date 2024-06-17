export function noCORSGet(url: string, init?: RequestInit) {
  return fetch(url, { ...init, method: "GET", mode: "no-cors" });
}

class CouldNotFetchTextError extends Error {
  constructor(url: string, options?: ErrorOptions) {
    super(`Could not fetch text at \`${url}\`!`, options);
  }
}

class EmptyTextResponseError extends Error {
  constructor(url: string, options?: ErrorOptions) {
    super(`\`${url}\` returned an empty response!`, options);
  }
}

export async function noCORSGetText(url: string, init?: RequestInit) {
  return noCORSGet(url, init)
    .then((response) => {
      if (response.ok) {
        return response.text();
      }
      throw new CouldNotFetchTextError(url);
    })
    .then((text) => {
      if (!text) {
        throw new EmptyTextResponseError(url);
      }
      return text;
    });
}
