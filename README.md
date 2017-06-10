# WinRT-wake-lock-polyfill
# wake-lock.js
### A polyfill for the w3c wake-lock spec using the WinRT APIs for Edge PWAs

The [wake-lock](https://w3c.github.io/wake-lock/) API is not currently supported in [Edge](https://www.microsoft.com/en-us/windows/microsoft-edge), which is a bummer. I want to use it in my [PWA](https://en.wikipedia.org/wiki/Progressive_web_app), but can't because it hasn't been added yet. However, because Edge's PWA's are websites wrapped in [Universal Windows Platform](https://docs.microsoft.com/en-us/windows/uwp/get-started/whats-a-uwp) apps, we have access to the [WinRT](https://en.wikipedia.org/wiki/Windows_Runtime) APIs.

Rather than implement the same logic using the wake-lock API _and_ the [DisplayRequest](https://docs.microsoft.com/en-us/uwp/api/windows.system.display.displayrequest), you can drop in this polyfill and just implement the standards version of wake-lock on your web app.
