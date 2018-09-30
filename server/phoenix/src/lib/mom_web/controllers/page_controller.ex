defmodule MomWeb.PageController do
  use MomWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
