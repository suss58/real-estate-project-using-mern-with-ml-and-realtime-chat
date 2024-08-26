import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useEffect, useState } from "react";
import { firebaseApp } from "../firebase";
import { ToastContainer, toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import MapComponent from "../components/MapComponent";

const UpdatePost = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [imageFile, setImageFile] = useState([]);
  const [uploadError, setUploadError] = useState({
    isError: false,
    message: "",
  });
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);
  const [isOffer, setIsoffer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    imgUrl: [],
  });

  const [dataLoading, setDataLoading] = useState(false);

  const navigate = useNavigate();
  const params = useParams();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  //===Load Post informations here===//
  useEffect(() => {
    const getPostInfo = async () => {
      setDataLoading(true);
      const res = await fetch(`/api/posts/${params.id}`);
      const data = await res.json();

      if (data.success === false) {
        toast.error(data.message, {
          autoClose: 2000,
        });
        setDataLoading(false);
      } else {
        setFeildValue(data);
        setFormData({ ...formData, imgUrl: data.imgUrl });
        data.offer && setIsoffer(true);
        setDataLoading(false);
      }
    };
    getPostInfo();
  }, []);

  const setFeildValue = (data) => {
    setValue("title", data.title);
    setValue("description", data.description);
    setValue("address", data.address);
    setValue("type", data.type);
    setValue("area", data.area && data.area);
    setValue("bath", data.bath);
    setValue("bed", data.bed);
    setValue("furnished", data.furnished);
    setValue("parking", data.parking);
    setValue("offer", data.offer);
    setValue("price", data.price);
    setValue("discountPrice", data.discountPrice);
  };

  const handleImageUpload = async () => {
    if (imageFile.length > 0 && imageFile.length + formData.imgUrl.length < 7) {
      setLoading(true);
      const promises = [];
      for (let i = 0; i < imageFile.length; i++) {
        promises.push(uploadToFirebase(imageFile[i]));
        Promise.all(promises)
          .then((urls) => {
            setFormData({ ...formData, imgUrl: formData.imgUrl.concat(urls) });
            setLoading(false);
          })
          .catch((error) => {
            setUploadError({ ...uploadError, isError: true, message: error });
            setLoading(false);
          });
      }
    } else {
      setUploadError({
        ...uploadError,
        isError: true,
        message: "Select file first (max:6)",
      });
      setLoading(false);
    }
  };

  const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(firebaseApp);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      //===Start Uploading===//
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          reject("File uploaded Falied");
        },

        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleDelete = (index) => {
    setFormData({
      ...formData,
      imgUrl: formData.imgUrl.filter(
        (items) => items != formData.imgUrl[index]
      ),
    });
  };

  uploadError.isError &&
    toast.error(uploadError.message, {
      autoClose: 2000,
    });

  //settting up location
  const [location, setLocation] = useState({ lat: null, lng: null });
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
  };

  const handleFormSubmit = async (data) => {
    try {
      setFormSubmitLoading(true);
      const res = await fetch(`/api/posts/update/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          imgUrl: formData.imgUrl,
          userRef: currentUser._id,
        }),
      });
      const serverRes = await res.json();
      if (serverRes.success === false) {
        toast.error(serverRes.message, {
          autoClose: 2000,
        });
        setFormSubmitLoading(false);
      } else {
        navigate(`/listing/${serverRes._id}`);
        setFormSubmitLoading(false);
      }
    } catch (error) {
      toast.error(error.message, {
        autoClose: 2000,
      });
      setFormSubmitLoading(false);
    }
  };

  //predicting data
  const [prediction, setPrediction] = useState(null);
  const handlePredict = async () => {
    // Get values from form
    const Yourarea = getValues("Yourarea");
    const roadsize = getValues("Road");
    const builtyear = getValues("builtyear");
    const area = getValues("area");
    const bed = getValues("bed");
    const living = getValues("living");
    const kitchen = getValues("kitchen");
    const bath = getValues("bath");
    const direction = getValues("direction");
    const housetype = getValues("housetype");
    const parking = getValues("parking");

    // Validate required fields
    if (
      !Yourarea ||
      !roadsize ||
      !builtyear ||
      !area ||
      !bed ||
      !living ||
      !kitchen ||
      !bath ||
      !direction ||
      !housetype ||
      !parking
    ) {
      toast.error("Please fill out all required fields.", { autoClose: 2000 });
      return; // Stop function execution
    }

    // Prepare data for the request
    const predictionData = {
      Yourarea,
      roadsize,
      builtyear,
      area,
      bed,
      living,
      kitchen,
      bath,
      direction,
      housetype,
      parking,
    };

    try {
      const response = await fetch("http://localhost:3000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(predictionData),
      });
      const data = await response.json();
      if (response.ok) {
        setPrediction(data.prediction); // Assuming 'prediction' is the key returned
      } else {
        toast.error(data.error || "Prediction failed.", { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("Error making prediction: " + error.message, {
        autoClose: 2000,
      });
    }
  };
  // Other states
  const [propertyType, setPropertyType] = useState("rent"); // State for dropdown
  // Watch the propertyType value from react-hook-form
  const watchedPropertyType = watch("type", propertyType);

  // Sync useState with react-hook-form when watchedPropertyType changes
  useEffect(() => {
    setPropertyType(watchedPropertyType);
  }, [watchedPropertyType]);

  // Function to handle dropdown change
  const handlePropertyTypeChange = (e) => {
    setPropertyType(e.target.value);
  };

  return (
    <main>
      {dataLoading ? (
        <div>
          <Loading />
          <p className="font-heading text-brand-blue text-lg sm:text-2xl text-center">
            Loading...
          </p>
        </div>
      ) : (
        <section>
          <div className="container py-7 md:py-16 max-w-5xl">
            <h1 className="text-center text-2xl font-heading font-bold text-black">
              Update Your Post
            </h1>
            <div className="mt-8 form_container">
              <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="feilds_container grid gap-5 md:gap-10  grid-col-1 md:grid-cols-2 items-start  ">
                  {/* ====== Form Sections Start Form Here ===== */}
                  <div className="info_container">
                    <div className="input_fields space-y-4">
                      <input
                        id="title"
                        type="text"
                        placeholder="Enter property name"
                        name="title"
                        className="form_input border border-gray-300 focus:border-blue-500 bg-white rounded-lg placeholder-gray-500 text-base px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-200 outline-none"
                        min={8}
                        max={50}
                        {...register("title", {
                          required: "This field is required*",
                        })}
                      />
                      {errors.title && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.title.message}
                        </p>
                      )}

                      <textarea
                        id="description"
                        placeholder="Enter property description"
                        name="description"
                        className="form_input border border-gray-300 focus:border-blue-500 bg-white rounded-lg placeholder-gray-500 text-base px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-200 outline-none mt-3"
                        {...register("description", {
                          required: "This field is required*",
                        })}
                      />
                      {errors.description && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.description.message}
                        </p>
                      )}

                      <input
                        id="address"
                        type="text"
                        placeholder="Enter property address"
                        name="address"
                        className="form_input border border-gray-300 focus:border-blue-500 bg-white rounded-lg placeholder-gray-500 text-base px-4 py-2 transition duration-300 ease-in-out focus:ring-2 focus:ring-blue-200 outline-none mt-3"
                        {...register("address", {
                          required: "This field is required*",
                        })}
                      />
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.address.message}
                        </p>
                      )}
                    </div>

                    <div className="additional_info mt-6 max-w-xs">
                      <div className="property_type">
                        <p className="font-heading text-black">
                          Select property type
                        </p>
                        <div className="form-control mt-2">
                          <select
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white py-1 px-2 w-full"
                            name="type"
                            id="propertyType"
                            value={propertyType}
                            onChange={handlePropertyTypeChange}
                            {...register("type", {
                              required: "This field is required*",
                            })}
                          >
                            <option value="sale">For Sale</option>
                            <option value="rent">For Rent</option>
                          </select>
                          {errors.type && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.type.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="property_info mt-3">
                        <p className="font-heading text-black">
                          Genarel Information
                        </p>
                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="area"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Area <small>(sqft)</small>
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={250}
                            type="number"
                            name="area"
                            id="area"
                            {...register("area", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.area && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.area.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="bed"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Bedrooms
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            type="number"
                            name="beds"
                            id="bed"
                            {...register("bed", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.bed && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.bed.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="bath"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Bathrooms
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            type="number"
                            name="bath"
                            id="bath"
                            {...register("bath", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.bath && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.bath.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="living"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Living Rooms
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            type="number"
                            name="living"
                            id="living"
                            {...register("living", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.living && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.living.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="living"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            {" "}
                            kitchen
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            type="kitchen"
                            name="kitchen"
                            id="kitchen"
                            {...register("kitchen", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.living && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.living.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="BHK"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Total BHK
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            type="number"
                            name="BHK"
                            id="BHK"
                            {...register("BHK", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.No_of_Flat && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.No_of_Flat.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="builtyear"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Built year
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            type="number"
                            name="builtyear"
                            id="builtyear"
                            {...register("builtyear", {
                              required: "This field is required*",
                              validate: {
                                notFutureYear: (value) =>
                                  value <= new Date().getFullYear() + 57 ||
                                  "Built year cannot be in the future*",
                              },
                            })}
                          />
                          {errors.builtyear && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.builtyear.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="location"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Select Your area
                          </label>
                          <select
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            name="Yourarea"
                            id="Yourarea"
                            {...register("Yourarea", {
                              required: "This field is required*",
                            })}
                          >
                            <option value="" disabled>
                              Select location
                            </option>
                            <option value="Amarsingh">Amarsingh</option>
                            <option value="Bagar">Bagar</option>
                            <option value="Bijyapur">Bijyapur</option>
                            <option value="Bindabasini">Bindabasini</option>
                            <option value="Birauta">Birauta</option>
                            <option value="Budibazar">Budibazar</option>
                            <option value="Chauthe">Chauthe</option>
                            <option value="Chipledhunga">Chipledhunga</option>
                            <option value="Chhorepatan">Chhorepatan</option>
                            <option value="Fulbari">Fulbari</option>
                            <option value="Gagangauda">Gagangauda</option>
                            <option value="Gharipatan">Gharipatan</option>
                            <option value="Indrapuri Tole">
                              Indrapuri Tole
                            </option>
                            <option value="Khalte  Mashina">
                              Khalte Mashina
                            </option>
                            <option value="Lamachaur">Lamachaur</option>
                            <option value="Lakeside">Lakeside</option>
                            <option value="Lekhnath">Lekhnath</option>
                            <option value="Malepatan">Malepatan</option>
                            <option value="Nayagaun">Nayagaun</option>
                            <option value="NewRoad">NewRoad</option>
                            <option value="Parsyang">Parsyang</option>
                            <option value="Phulbari">Phulbari</option>
                            <option value="Prithvi Chowk">Prithvi Chowk</option>
                            <option value="Rambagar">Rambagar</option>
                            <option value="Santi Tole">Santi Tole</option>
                            <option value="Simpani">Simpani</option>
                            <option value="Sitadevi">Sitadevi</option>
                            <option value="Sisuwa">Sisuwa</option>
                            <option value="Zero Kilometer">
                              Zero Kilometer
                            </option>
                          </select>
                          {errors.location && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.location.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="parking"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Parking (number of cars or if bike then it will be
                            1)
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={0}
                            type="number"
                            name="parking"
                            id="parking"
                            {...register("parking", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.parking && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.parking.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="additional_feature mt-3">
                        <p className="font-heading text-black">
                          Additional Information
                        </p>
                        <div className="max-w-[300px] mt-1">
                          <label
                            htmlFor="condition"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Overall condition (1 = worst, 5 = good, 10 =
                            excellent)
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            min={1}
                            max={10}
                            type="number"
                            name="condition"
                            id="condition"
                            {...register("condition", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.condition && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.condition.message}
                            </p>
                          )}
                        </div>
                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="housetype"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            House Type
                          </label>
                          <select
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white py-1 px-2 w-full"
                            name="housetype"
                            id="housetype"
                            {...register("housetype", { required: "Required" })}
                          >
                            <option value="" disabled>
                              Select type
                            </option>
                            <option value="Commercial">Commercial</option>
                            <option value="Semi-commercial">
                              Semi-commercial
                            </option>
                            <option value="Residential">Residential</option>
                            <option value="Bungalow">Bungalow</option>
                            <option value="Standalone">Standalone</option>
                          </select>
                          {errors.housetype && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.housetype.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="direction"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Direction
                          </label>
                          <select
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm py-1 px-2 w-full"
                            name="direction"
                            id="direction"
                            {...register("direction", {
                              required: "This field is required*",
                            })}
                          >
                            <option value="" disabled>
                              Select direction
                            </option>
                            <option value="East">East</option>
                            <option value="West">West</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="South West">South West</option>
                            <option value="South East">South East</option>
                            <option value="North East">North East</option>
                          </select>
                          {errors.direction && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.direction.message}
                            </p>
                          )}
                        </div>

                        <div className="max-w-[300px] mt-2">
                          <label
                            htmlFor="builtyear"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Road Size in feet
                          </label>
                          <input
                            className="border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full"
                            type="number"
                            name="Road"
                            id="Road"
                            {...register("Road", {
                              required: "This field is required*",
                            })}
                          />
                          {errors.builtyear && (
                            <p className="text-red-700 text-xs font-semibold mt-1">
                              {errors.builtyear.message}
                            </p>
                          )}
                        </div>

                        <div className="form-control">
                          <label className="label cursor-pointer flex items-center justify-start gap-2">
                            <input
                              id="furnished"
                              type="checkbox"
                              className="checkbox w-5 h-5 border-gray-400 rounded-full checked:bg-brand-blue"
                              {...register("furnished")}
                            />
                            <span className="label-text font-medium">
                              Furnished
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === Image Uploading Section Start Here === */}
                  <div>
                    <div>
                      {" "}
                      <MapComponent onLocationSelect={handleLocationSelect} />
                    </div>

                    <p className="font-content text-[18px] text-red-500 mb-2 mt-5 pt-2 font-normal ">
                      <span className="font-semibold mr-1 ">Note:</span>
                      First image will be cover image (max:6)
                    </p>
                    <div className="image_upload_container md:p-5 md:border-2 bg-transparent border-dashed rounded-sm md:flex items-center justify-center gap-2">
                      <input
                        onChange={(e) => setImageFile(e.target.files)}
                        multiple
                        accept="image/*"
                        type="file"
                        className={`file-input file:bg-brand-blue bg-red-00 ${
                          loading ? "md:w-4/6" : "md:w-4/5"
                        } w-full`}
                      />
                      <button
                        disabled={loading || imageFile.length === 0}
                        onClick={handleImageUpload}
                        type="button"
                        className={`w-full text-green-600 text-sm py-2 border-2 border-green-600 rounded-md mt-2 uppercase font-heading  ${
                          loading ? "md:w-2/6" : "md:w-1/5"
                        } md:h-[3rem] md:mt-0 duration-500 hover:shadow-lg disabled:border-gray-500 disabled:text-gray-500`}
                      >
                        {loading ? "Uploading..." : "Upload"}
                      </button>
                    </div>

                    <div>
                      {formData.imgUrl.length > 0 &&
                        formData.imgUrl.map((imgSrc, index) => {
                          return (
                            <div
                              key={index}
                              className="uploaded_images p-2 pr-5 border-2 mt-4  rounded-md flex items-center justify-between"
                            >
                              <img
                                src={imgSrc}
                                alt="property Image"
                                className="w-24 h-20 object-cover rounded-md"
                              />
                              <button
                                onClick={() => handleDelete(index)}
                                type="button"
                                className="font-medium text-lg text-red-700 flex items-center underline hover:opacity-75"
                              >
                                Delete
                              </button>
                            </div>
                          );
                        })}
                      <div className="pt-4">
                        <label className="label cursor-pointer flex items-center justify-start gap-2">
                          <input
                            id="offer"
                            type="checkbox"
                            className="checkbox w-5 h-5 border-gray-400 rounded-full checked:bg-brand-blue"
                            {...register("offer")}
                            onChange={() => setIsoffer(!isOffer)}
                          />
                          <span className="label-text font-bold text-red-500">
                            Do you have any discount?
                          </span>
                        </label>
                      </div>

                      <div className=" mt-1">
                        <div className="pricing_info flex flex-col">
                          <p className="mt-2  font-heading text-black text-[18px">
                            House Price:{" "}
                          </p>
                          <span className="text-sm font-content text-red-900"></span>
                          <div className="flex flex-row mt-2 ">
                            <span className="flex items-center bg-grey-lighter rounded rounded-r-none px-2 font-bold text-grey-darker text-[17px]">
                              Rs.
                            </span>
                            <input
                              id="price"
                              type="number"
                              name="price"
                              className="bg-slate-100 p-2 rounded-md text-grey-darkest border-2 focus:border-brand-blue font-bold text-red-700 text-lg max-w-[200px]"
                              {...register("price", {
                                required: "This feild is required*",
                              })}
                            />
                          </div>
                          {errors.price && (
                            <p className="text-red-700 text-xs font-semibold">
                              {errors.price.message}
                            </p>
                          )}
                        </div>
                        {isOffer && (
                          <div className="pricing_info flex flex-col">
                            <p className="mt-3  font-heading text-black">
                              Discount Price:{" "}
                            </p>
                            <span className="text-sm font-content font-bold text-red-900"></span>
                            <div className="flex flex-row mt-2 ">
                              <span className="flex items-center bg-grey-lighter rounded rounded-r-none px-2 font-bold text-grey-darker text-[17px]">
                                Rs.
                              </span>
                              <input
                                id="discountPrice"
                                type="number"
                                name="discountPrice"
                                className="bg-slate-100 p-2 rounded-md text-grey-darkest border-2 focus:border-brand-blue font-bold text-red-700 text-lg max-w-[200px]"
                                {...register("discountPrice", {
                                  required: "This feild is required*",
                                  validate: (value) => {
                                    const { price } = getValues();
                                    if (+price < +value) {
                                      return "*Discount price should be lower than regular price";
                                    }
                                  },
                                })}
                              />
                            </div>
                            {errors.discountPrice && (
                              <p className="text-red-700 text-xs font-semibold">
                                {errors.discountPrice.message}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-center mt-7">
                          {propertyType === "sale" && (
                            <button
                              type="button"
                              onClick={handlePredict}
                              className="w-full max-w-md bg-green-600 text-xl tracking-wide font-semibold rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300 text-white py-3 px-5"
                            >
                              Predict Price
                            </button>
                          )}
                        </div>

                        {prediction !== null && (
                          <div className="flex justify-center">
                            <h2 className="text-2xl font-semibold text-black">
                              Predicted Price:{" "}
                              <span className="text-green-600">
                                {Intl.NumberFormat("en-NP", {
                                  style: "currency",
                                  currency: "NPR",
                                }).format(prediction)}
                              </span>
                            </h2>
                          </div>
                        )}

                        <div className="flex justify-center mt-7">
                          <div className="post_btn mt-7">
                            <button
                              disabled={
                                formData.imgUrl.length < 1 ||
                                loading ||
                                formSubmitLoading
                              }
                              type="submit"
                              className="w-full bg-brand-blue text-xl tracking-wider font-heading rounded-md hover:opacity-90 disabled:opacity-70 duration-300 text-white p-3"
                            >
                              {formSubmitLoading
                                ? "Updating..."
                                : "Update Post"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <ToastContainer />
        </section>
      )}
    </main>
  );
};

export default UpdatePost;
