module Headless
  class DescriptionComponent < ApplicationComponent
    attr_reader :tag, :id

    def initialize(tag: :p, id: object.id, **options)
      @tag = tag
      @id = id
      super(**options)
    end

    def before_render
      merge_options!({
        id: @id,
        data: {
          headless__description_target: "description",
        }
      })
    end

    def call
      content_tag(tag, content, **@options)
    end
  end
end