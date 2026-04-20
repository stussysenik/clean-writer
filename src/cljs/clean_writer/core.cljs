(ns clean-writer.core
  (:require [reagent.core :as r]
            [reagent.dom :as rdom]))

;; Define a reactive atom for state management
(def app-state (r/atom {:count 0
                         :color "blue"
                         :last-ts nil})) ; Add a field for the last timestamp

;; A simple Reagent component using Hiccup syntax
;; This component demonstrates state, an event handler, and inline CSS adjustments.
(defn counter-component [props] ; Accept props
  (let [{:keys [count color last-ts]} @app-state ; Dereference the atom to get current state
        {:keys [logMessage getTimestamp]} props] ; Destructure interop functions from props
    [:div {:style {:padding "20px"
                   :border "1px solid gray"
                   :borderRadius "5px"
                   :backgroundColor "#f0f0f0"
                   :display "flex"
                   :flexDirection "column"
                   :alignItems "center"}}
     [:h2 {:style {:color color}} "ClojureScript Counter"]
     [:p {:style {:fontSize "1.2em"}} "Count: " count]
     [:p {:style {:fontSize "0.8em" :marginTop "10px"}}
      (when last-ts
        (str "Last TS from TS: " last-ts))] ; Display last timestamp from TS
     [:div {:style {:display "flex" :gap "10px" :marginTop "10px"}}
      [:button {:on-click #(swap! app-state update :count inc)
                :style {:backgroundColor color
                        :color "white"
                        :padding "10px 15px"
                        :border "none"
                        :borderRadius "3px"
                        :cursor "pointer"}}
       "Increment"]
      [:button {:on-click #(swap! app-state assoc :color (if (= color "blue") "red" "blue"))
                :style {:backgroundColor (if (= color "blue") "red" "blue")
                        :color "white"
                        :padding "10px 15px"
                        :border "none"
                        :borderRadius "3px"
                        :cursor "pointer"}}
       "Toggle Color"]
      [:button {:on-click #(do
                             (logMessage (str "Count is " count " from CLJS!")) ; Call TS function
                             (let [ts (getTimestamp)] ; Call TS function and get result
                               (swap! app-state assoc :last-ts ts))) ; Update CLJS state with TS result
                :style {:backgroundColor "#4CAF50" ; Green button
                        :color "white"
                        :padding "10px 15px"
                        :border "none"
                        :borderRadius "3px"
                        :cursor "pointer"}}
       "Log & Get TS from TS"]]]))

;; This function will be exported as the default component for React
;; It simply renders our counter-component, passing props through
(defn app-component [props]
  [counter-component props]) ; Pass props to the child component

;; FFI: Function to allow TypeScript to read ClojureScript's current count state
(defn get-current-cljs-count []
  (:count @app-state))

;; FFI: Function to allow TypeScript to set ClojureScript's count state
(defn set-cljs-count [new-count]
  (swap! app-state assoc :count new-count))

;; Optional: Initialization function (if needed for more complex setups)
(defn init []
  (println "ClojureScript app initialized!"))

;; Optional: Hot-rereloading hook for development
(defn reload-hook []
  (println "ClojureScript app reloaded!"))

;; Entry point for the shadow-cljs dev server (not strictly needed for React interop)
(defn ^:dev/after-load mount-root []
  (rdom/render [app-component nil] (.getElementById js/document "app")))

(when ^boolean js/goog.DEBUG
  (mount-root))
