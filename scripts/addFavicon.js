export function addFavicon() {
  if (!document.querySelector("link[rel='icon']")) {
    var link = document.createElement("link");
    link.rel = "icon";
    link.href = "/assets/icons/small-logo.svg";
    link.type = "image/svg+xml";
    document.head.appendChild(link);
  }
}
