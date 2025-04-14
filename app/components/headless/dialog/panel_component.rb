module Headless
  module Dialog
    class PanelComponent < ApplicationComponent
      DEFAULT_TAG = :div

      attr_reader :tag

      def initialize(tag: DEFAULT_TAG, **options)
        @tag = tag
        @options = options
        @options[:tag] = @tag
        @options[:id] ||= "headlessui-dialog-panel-#{SecureRandom.hex(4)}"
        # Add data attributes for Stimulus controller targets if needed
        @options[:data] ||= {}
        @options[:data][:headless__dialog_target] = "panel" # Example target
        super(**@options)
      end

      def call
        tag.public_send(@tag, **@options) do
          content
        end
      end
    end
  end
end