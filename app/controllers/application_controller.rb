class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # omniauth
  private
  def current_user
    @current_user ||= User.find_by(:id => session[:user_id]) if session[:user_id]
  end
  helper_method :current_user

  def authorise
    flash[:error] = "You need to be logged in to see that" unless @current_user.present?
    redirect_to login_path unless @current_user.present?
  end

end
