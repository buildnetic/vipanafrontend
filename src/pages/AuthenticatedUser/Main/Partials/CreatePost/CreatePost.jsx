import SelectWithSearch from "../../../../../components/AuthenticatedUser/SelectWithSearch/SelectWithSearch";
import { stockExchangeList } from "../../../../../data/stockExchangeList";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axiosInstance from "../../../../../AxiosInstance";
import { ToastError, ToastSuccess } from "../../../../../ToastNotification";
import { useSelector } from "react-redux";
import ProfileImg from "../../../../../assets/images/profile-icon.png";
import { useLocation, useNavigate } from "react-router-dom";

const CreatePost = () => {
  const { loggedUser } = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedExchange, setSelectedExchange] = useState(
    stockExchangeList[0]
  );

  const [formData, setFormData] = useState({
    type: "",
    description: "",
    exchange_code: selectedExchange.code || "",
    stock_code: "",
    stock_name: "",
    current_price: "",
    target_price: "",
    hashtags: [],
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, exchange_code: selectedExchange.code }));
  }, [selectedExchange]);

  const [stockCodeError, setStockCodeError] = useState(false);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;

    if (name === "hashtags") {
      const hashtagsArray = value.split(" ");
      setFormData((prev) => ({ ...prev, [name]: hashtagsArray }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const getCurrentPrice = async () => {
    const res = await axios.get(
      `/api/search.json?engine=google_finance&api_key=${
        import.meta.env.VITE_APP_GOOGLE_FIN_TOKEN
      }&q=${formData.stock_code}:${selectedExchange.code}`
    );
    return res;
  };

  const createPost = async () => {
    axiosInstance.defaults.headers[
      "Authorization"
    ] = `Bearer ${loggedUser.token}`;
    const res = await axiosInstance.post("/create/vips", formData);
    delete axiosInstance.defaults.headers["Authorization"];
    return res;
  };

  const getCurrentPriceQuery = useQuery("currentPrice", getCurrentPrice, {
    enabled: false,
    onSuccess: (res) => {
      if (res?.data?.summary) {
        setFormData((prev) => ({
          ...prev,
          stock_name: res?.data?.summary?.title,
        }));
        setFormData((prev) => ({
          ...prev,
          current_price: res?.data?.summary?.extracted_price,
        }));
        setStockCodeError(false);
      } else {
        setFormData((prev) => ({ ...prev, stock_name: "" }));
        setFormData((prev) => ({
          ...prev,
          current_price: "",
        }));
        ToastError("Invalid Exchange or Stock code");
      }
    },
    onError: () => {
      ToastError("Error");
    },
  });

  const createPostMutation = useMutation(createPost, {
    onSuccess: (res) => {
      ToastSuccess(res?.data?.message);
      queryClient.invalidateQueries("getAllPost");
      navigate("/main");
    },
    onError: (error) => {
      ToastError(error?.response?.data?.message);
      console.log("error", error);
    },
  });

  const currentPriceHandler = async (e) => {
    e.preventDefault();
    if (formData.stock_code) {
      getCurrentPriceQuery.refetch();
    } else {
      setStockCodeError(true);
    }
  };

  const formHandler = (e) => {
    e.preventDefault();

    if (location.pathname.startsWith("/post/edit")) {
      alert("edit");
    } else {
      createPostMutation.mutate(formData);
    }
  };

  return (
    <>
      <div className="flex flex-row gap-4">
        <img
          src={
            !loggedUser.user_profile_image
              ? ProfileImg
              : loggedUser.user_profile_image
          }
          alt="Profile Image"
          className={`w-12 h-12 rounded-full border-2 border-gray-100 object-cover ${
            !loggedUser.user_profile_image && "p-1.5"
          }`}
        />
        <div className="w-full">
          <div className="flex flex-row justify-between mt-4">
            <div className="grid grid-cols-12 gap-5">
              <div className="flex flex-row gap-5 items-center">
                <div className="flex">
                  <input
                    type="radio"
                    name="type"
                    className="shrink-0 cursor-pointer mt-0.5 border-gray-400 rounded-full text-c-green pointer-events-none focus:ring-c-green"
                    id="buy"
                    value="buy"
                    onChange={onChangeHandler}
                  />
                  <label
                    htmlFor="buy"
                    className="text-sm text-gray-500 ml-2 cursor-pointer"
                  >
                    Buy
                  </label>
                </div>

                <div className="flex">
                  <input
                    type="radio"
                    name="type"
                    className="shrink-0 cursor-pointer mt-0.5 border-gray-400 rounded-full text-c-green pointer-events-none focus:ring-c-green"
                    id="sell"
                    value="sell"
                    onChange={onChangeHandler}
                  />
                  <label
                    htmlFor="sell"
                    className="text-sm text-gray-500 ml-2 cursor-pointer"
                  >
                    Sell
                  </label>
                </div>
              </div>
              <SelectWithSearch
                datas={stockExchangeList}
                selected={selectedExchange}
                setSelected={setSelectedExchange}
                classes="col-span-12"
              />
              <input
                type="text"
                name="stock_code"
                required
                placeholder="Stock Code"
                className={
                  stockCodeError
                    ? "col-span-4 block rounded-md border-red-600 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-c-green-dark sm:text-sm sm:leading-6"
                    : "col-span-4 block rounded-md text-sm h-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-c-green-dark sm:leading-6"
                }
                onChange={onChangeHandler}
                title="Stock Code"
              />
              <button
                type="button"
                disabled={
                  getCurrentPriceQuery.isLoading ||
                  getCurrentPriceQuery.isRefetching
                }
                onClick={currentPriceHandler}
                className=" col-span-3 rounded-md w-full border-gray-300 border-2 bg-gray-300 shadow-sm hover:shadow-none text-gray-900 duration-75 text-sm font-medium"
              >
                {getCurrentPriceQuery.isLoading ||
                getCurrentPriceQuery.isRefetching
                  ? "Getting Price..."
                  : "Get Current Price"}
              </button>
              <div className="col-span-5">
                <span
                  className=" px-3 cursor-not-allowed flex items-center rounded-md text-sm h-full border-0  text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-c-green-dark sm:leading-6 bg-gray-100"
                  title={formData.stock_name}
                >
                  Current Price:{" "}
                  {getCurrentPriceQuery.isLoading ||
                  getCurrentPriceQuery.isRefetching
                    ? "Fetching..."
                    : formData.current_price}
                </span>
              </div>
              <input
                type="text"
                name="target_price"
                required
                placeholder="Target Price"
                className=" col-span-4 block rounded-md text-sm h-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-c-green-dark sm:leading-6"
                onChange={onChangeHandler}
              />
              <input
                type="text"
                name="hashtags"
                placeholder="#hashtags #vipana"
                className="col-span-8 block rounded-md text-sm h-full border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-c-green-dark sm:leading-6"
                onChange={onChangeHandler}
              />
              <textarea
                name="description"
                id="message"
                rows="4"
                className="col-span-12 resize-y block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-c-green focus:border-c-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-c-green dark:focus:border-c-green"
                placeholder="Your message..."
                onChange={onChangeHandler}
              ></textarea>

              <button
                type="button"
                onClick={formHandler}
                className=" col-span-12 rounded-md h-full w-full border-c-green border-2 bg-c-green p-2 shadow-md hover:shadow-none text-white duration-75 text-sm font-medium"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
