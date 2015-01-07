CrissCross::Application.routes.draw do

  root 'main#index'
  match '/index' => 'main#index', via: 'get'
  match 'main/home' => 'main#home', via: 'get'
  match '/users/check_email' => 'users#check_email', via: 'get'

  #resources :users, only: [:new, :create, :destroy, :edit, :show, :update]
  match '/register' => 'users#new', via: 'get'
  match '/list' => 'users#list', via: 'get'
  resources :users do
    member do
      get :following, :followers
    end
  end

  resources :sessions, only: [:new, :create, :destroy]
  match '/signin' => 'sessions#new', via: 'get'
  match '/signout' => 'sessions#destroy', via: 'delete'

  #resources :microposts


  #resources :microposts, :has_many => :comments
  #resources :microposts do
  #  member do
  #    get :comments
  #  end
  #end
  #resources :maps do
  #  member do
  #    get :comments
  #  end
  #end
  resources :microposts, only: [:create, :destroy] do
    resources :comments, only: [:new, :create, :index, :destroy]
  end
  resources :maps, only: [:new, :create, :destroy, :edit, :show] do
    resources :comments, only: [:new, :create, :index, :destroy]
  end
  #match '/microposts/:id/comments' => 'comments#index', via: 'get'
  #match '/maps/:id/comments' => 'comments#index', via: 'get'
  #match '/comments' => 'comments#index', via: 'get'

  #
  #resources :maps, only: [:new, :create, :destroy, :edit, :show]
  match '/maps/check_marker' => 'maps#check_marker', via: 'post'
  match '/maps/find_markers' => 'maps#find_markers', via: 'post'
  match '/map/show' => 'maps#current_map', via: 'get'
  match '/map/update' => 'maps#update', via: 'post'

  resources :markers, only: [:create, :destroy]
  match '/markers/destroy' => 'maps#destroy', via: 'delete'

  resources :relationships, only: [:create, :destroy]

#get "main/index"
# The priority is based upon order of creation: first created -> highest priority.
# See how all your routes lay out with "rake routes".

# You can have the root of your site routed with "root"
# root 'welcome#index'

# Example of regular route:
#   get 'products/:id' => 'catalog#view'

# Example of named route that can be invoked with purchase_url(id: product.id)
#   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

# Example resource route (maps HTTP verbs to controller actions automatically):
#   resources :products

# Example resource route with options:
#   resources :products do
#     member do
#       get 'short'
#       post 'toggle'
#     end
#
#     collection do
#       get 'sold'
#     end
#   end

# Example resource route with sub-resources:
#   resources :products do
#     resources :comments, :sales
#     resource :seller
#   end

# Example resource route with more complex sub-resources:
#   resources :products do
#     resources :comments
#     resources :sales do
#       get 'recent', on: :collection
#     end
#   end

# Example resource route with concerns:
#   concern :toggleable do
#     post 'toggle'
#   end
#   resources :posts, concerns: :toggleable
#   resources :photos, concerns: :toggleable

# Example resource route within a namespace:
#   namespace :admin do
#     # Directs /admin/products/* to Admin::ProductsController
#     # (app/controllers/admin/products_controller.rb)
#     resources :products
#   end
end
