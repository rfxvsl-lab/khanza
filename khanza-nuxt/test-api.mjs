(async () => {
  try {
    const res = await fetch("http://localhost:3000/api/services");
    const json = await res.json();
    console.log("Services API result length:", json?.length);
    console.log(json);
  } catch (e) {
    console.error("API Error:", e);
  }
})();
