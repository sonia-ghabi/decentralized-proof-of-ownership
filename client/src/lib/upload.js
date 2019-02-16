const serverUrl = "http://localhost:4000/";

/**
 * Claim the ownership of the given picture.
 * @param {File[]} files // we will only proceed the 1st picture
 * @param {string} name
 */
export async function claimOwnership(files, name) {
  return executePost(files, false, name);
}

/**
 * Check the ownership of the given picture.
 * @param {File[]} files  // we will only proceed the 1st picture
 */
export async function checkOwnership(files) {
  return executePost(files, true);
}

/**
 * Execute thePOST request.
 * @param {File[]} files  // we will only proceed the 1st picture
 * @param {boolean} isCheck
 * @param {string} name
 */
async function executePost(files, isCheck, name = null) {
  // Set the form data
  const formData = new FormData();
  formData.append("img", files[0]);
  formData.append("owner", "0x48d5b4a2e20aff869fa58600860d5ec615ee0046");
  if (name) formData.append("name", name);

  // Execute the request
  const url = isCheck ? serverUrl + "check" : serverUrl;
  const response = await fetch(url, {
    method: "POST",
    body: formData
  });
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
