Rails.application.routes.draw do

  post '/rate' => 'rater#create', :as => 'rate'
  root 'areas#index'
  resources :users
  resources :areas

  resources :areas do
    resources :reviews
  end

  # Session
  get '/login' => 'sessions#new', :as => "login"
  post '/login' => 'sessions#create'
  delete '/logout' => 'sessions#destroy', :as => "logout"

  match 'auth/:provider/callback', to: 'sessions#facebook_create', via: [:get, :post]
  match 'auth/failure', to: redirect('/'), via: [:get, :post]

end
