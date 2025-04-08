# frozen_string_literal: true

class Headless::InstallGenerator < Rails::Generators::Base
  source_root File.expand_path("templates", __dir__)

  def copy_files
    template "config/headless.yml"
  end
end
