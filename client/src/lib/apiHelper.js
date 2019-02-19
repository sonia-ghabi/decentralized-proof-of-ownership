const serverUrl = "http://localhost:4000/";

/**
 * Claim the ownership of the given picture.
 * @param {File[]} files // we will only proceed the 1st picture
 * @param {string} fileName
 * @param {string} idToken
 */
export async function claimOwnership(files, fileName, idToken) {
  // Set the form data
  const formData = new FormData();
  formData.append("img", files[0]);
  formData.append("fileName", fileName);
  formData.append("idToken", idToken);

  // Execute the request
  return await executePost(formData, "");
}

/**
 * Check the ownership of the given picture.
 * @param {File[]} files  // we will only proceed the 1st picture
 */
export async function checkOwnership(files) {
  // Set the form data
  const formData = new FormData();
  formData.append("img", files[0]);

  // Execute the request
  return await executePost(formData, "check");
}

export async function generateKeys(idToken) {
  // Execute the request
  return await executePost(JSON.stringify({ idToken }), "generateKeys", true);
}

/**
 * Execute the post request.
 * @param {*} formData
 * @param {*} endpoint
 */
async function executePost(formData, endpoint, isJson = null) {
  // Execute the request
  const url = serverUrl + endpoint;
  let req = {
    method: "POST",
    body: formData
  };
  if (isJson) {
    req.headers = {
      "Content-Type": "application/json"
    };
  }
  const response = await fetch(url, req);
  return response;
}

/**
 * Load the album.
 */
export async function load() {
  const res = await fetch(serverUrl + "load", {
    method: "GET"
  });
  return await res.json();
}
