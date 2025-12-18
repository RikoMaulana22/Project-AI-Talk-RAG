import { createApp } from "./app.js";

const { app, PORT } = createApp();
app.listen(PORT, () => console.log(`✅ Server berjalan di http://localhost:${PORT}`));
