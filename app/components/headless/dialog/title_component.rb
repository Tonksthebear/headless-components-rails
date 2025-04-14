module Headless
  module Dialog
    class TitleComponent < ApplicationComponent
      def initialize(**options)
        super(**options)
      end

      def call
        tag.public_send(@tag, **@options) do
          content
        end
      end
    end
  end
end