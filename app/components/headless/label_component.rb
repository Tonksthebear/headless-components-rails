module Headless
  class LabelComponent < ApplicationComponent
    attr_reader :id

    def initialize(as: :label, **options)
      @as = as
      @id = options[:id]
      super(**options)
    end

    def call
      content_tag(@as, content, **@options)
    end
  end
end
