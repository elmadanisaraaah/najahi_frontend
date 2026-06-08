const API_URL = (import.meta.env.VITE_API_URL || "") + "/api";

async function parseResponse(res) {
  const data = await res.json();
  if (!res.ok) { throw new Error(data.error || data.message || "Request failed"); }
  return data;
}

export async function loginRequest(p) {
  const res = await fetch(API_URL + "/auth/login", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  return parseResponse(res);
}

export async function registerRequest(p) {
  const res = await fetch(API_URL + "/auth/register", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  return parseResponse(res);
}

export async function forgotPasswordRequest(p) {
  const res = await fetch(API_URL + "/auth/forgot-password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
  return parseResponse(res);
}

export async function refreshRequest(t) {
  const res = await fetch(API_URL + "/auth/refresh", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:t})});
  return parseResponse(res);
}

export async function logoutRequest(t) {
  const res = await fetch(API_URL + "/auth/logout", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({refresh_token:t})});
  return parseResponse(res);
}

export async function getCurrentUser(t) {
  const res = await fetch(API_URL + "/profile/me", {method:"GET",headers:{"Content-Type":"application/json","Authorization":"Bearer " + t}});
  return parseResponse(res);
}
