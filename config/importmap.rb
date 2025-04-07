pin "headless/application", to: "headless/application.js"
pin "headless/el-transition", to: "libraries/headless/el-transition.js"
pin "@floating-ui/dom", to: "libraries/@floating-ui--dom.js" # @1.6.13
pin "@floating-ui/core", to: "libraries/@floating-ui--core.js" # @1.6.9
pin "@floating-ui/utils", to: "libraries/@floating-ui--utils.js" # @0.2.9
pin "@floating-ui/utils/dom", to: "libraries/@floating-ui--utils--dom.js" # @0.2.9
pin_all_from File.expand_path("../app/javascript/headless", __dir__), under: "headless"
pin_all_from File.expand_path("../app/javascript/controllers/headless", __dir__), under: "controllers/headless"
pin_all_from File.expand_path("../app/javascript/libraries", __dir__), under: "libraries"
