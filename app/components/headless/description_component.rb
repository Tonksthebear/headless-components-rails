module Headless
  class DescriptionComponent < ApplicationComponent
    def initialize(as: :p, **options)
      @as = as
      super(**options)
    end

    def before_render
      merge_options!({
        data: {
          headless__description_target: "description"
        }
      })
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
