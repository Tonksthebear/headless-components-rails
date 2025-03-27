class ComponentPreviewController < ApplicationController
  include ViewComponent::PreviewActions
  prepend_view_path Rails.root.join("..", "components", "previews")
end
