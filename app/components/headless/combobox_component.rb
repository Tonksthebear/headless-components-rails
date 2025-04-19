module Headless
  class ComboboxComponent < ApplicationComponent
    jsx_mapping file: "combobox", component: "Combobox"

    def initialize(as: :div, **options)
      @as = as
      super(**options)
    end

    def before_render
      merge_options!({
        data: {
          controller: "headless--combobox"
        }
      })
      merge_classes!("contents") if @as == :div && options[:class].blank?
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
