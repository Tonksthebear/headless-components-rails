pin "headless/application", to: "headless/application.js"
pin "headless/el-transition", to: "libraries/headless/el-transition.js"
pin_all_from File.expand_path("../app/javascript/controllers/headless", __dir__), under: "controllers/headless"
pin_all_from File.expand_path("../app/javascript/libraries", __dir__), under: "libraries"
