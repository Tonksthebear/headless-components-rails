module HeadlessViewComponent
  class Engine < ::Rails::Engine
    config.to_prepare do
      Classy::Yaml.setup do |config|
        config.engine_files << Engine.root.join("config/headless_view_component/utility_classes.yml")
        config.extra_files << Rails.root.join("config/headless_view_component/utility_classes.yml")
      end
    end

    initializer "headless_view_component.assets" do
      Rails.application.config.assets.precompile += %w[headless_view_component/manifest.js]
    end

    initializer "headless_view_component.importmap", before: "importmap" do |app|
      app.config.importmap.paths << Engine.root.join("config/importmap.rb")
      app.config.importmap.cache_sweepers << Engine.root.join("app/javascript")
    end

    initializer "headless_view_component.importmap.assets" do
      Rails.application.config.assets.paths << Engine.root.join("app/javascript")
    end
  end
end
