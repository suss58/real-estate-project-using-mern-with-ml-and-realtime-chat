import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react'
import { firebaseApp } from '../firebase';
import { ToastContainer, toast } from 'react-toastify';
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import MapComponent from "../components/MapComponent";


const CreatePost = () => {

    const { currentUser } = useSelector(state => state.user)

    const [imageFile, setImageFile] = useState([]);
    const [uploadError, setUploadError] = useState({
        isError: false,
        message: ''
    });
    const [formSubmitLoading, setFormSubmitLoading] = useState(false)
    const [isOffer, setIsoffer] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        imgUrl: [],
    })


    const navigate = useNavigate()
    const { register, handleSubmit, getValues, formState: { errors } } = useForm({
        mode: "onChange"
    });



    const [location, setLocation] = useState({ lat: null, lng: null });
    const handleLocationSelect = (selectedLocation) => {
        setLocation(selectedLocation);
    };

    const [prediction, setPrediction] = useState(null);




    const handleImageUpload = async () => {

        if (imageFile.length > 0 && imageFile.length + formData.imgUrl.length < 7) {
            setLoading(true)
            const promises = [];
            for (let i = 0; i < imageFile.length; i++) {
                promises.push(uploadToFirebase(imageFile[i]))
                Promise.all(promises).then((urls) => {
                    setFormData({ ...formData, imgUrl: formData.imgUrl.concat(urls) })
                    setLoading(false)
                }).catch((error) => {
                    setUploadError({ ...uploadError, isError: true, message: error })
                    setLoading(false)
                })
            }
        }
        else {
            setUploadError({ ...uploadError, isError: true, message: 'Select file first (max:6)' })
            setLoading(false)
        }

    }

    const uploadToFirebase = (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(firebaseApp);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            //===Start Uploading===//
            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                },
                (error) => {
                    reject('File uploaded Falied')
                },

                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL)
                    });
                }
            )
        })
    }

    const handleDelete = (index) => {
        setFormData({ ...formData, imgUrl: formData.imgUrl.filter((items) => items != formData.imgUrl[index]) })
    }

    uploadError.isError && toast.error(uploadError.message, {
        autoClose: 2000,
    })


    const handleFormSubmit = async (data) => {
        try {
            setFormSubmitLoading(true)
            const res = await fetch('api/posts/create', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    imgUrl: formData.imgUrl,
                    location: location,
                    userRef: currentUser._id
                })
            })
            const serverRes = await res.json();
            if (serverRes.success === false) {
                toast.error(serverRes.message, {
                    autoClose: 2000,
                })
                setFormSubmitLoading(false)
            }
            else {
                navigate(`/listing/${serverRes._id}`)
                setFormSubmitLoading(false)
            }

        } catch (error) {
            toast.error(error.message, {
                autoClose: 2000,
            })
            setFormSubmitLoading(false)
        }
    }



    const handlePredict = async () => {
        const predictionData = {
            Land_area: watch('Land_area'),
            Bedroom: watch('Bedroom'),
            Bathroom: watch('Bathroom'),
            No_of_Flat: watch('No_of_Flat'),
            Living_Room: watch('Living_Room'),
            Kitchen: watch('Kitchen'),
            Road_size: watch('Road_size'),
            Built_year: watch('Built_year'),
            Parking: watch('Parking'),
            Balcony: watch('Balcony'),
            OverallCondition: watch('OverallCondition'),
            District: watch('District'),
            Direction: watch('Direction'),
            House_type: watch('House_type')
        };

        try {
            const response = await fetch('http://localhost:3000/api/predict', {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json'
                },
                body: JSON.stringify(predictionData)
            });
            const data = await response.json();
            setPrediction(data.prediction);
        } catch (error) {
            toast.error('Error making prediction:', { autoClose: 2000 });
        }
    };




    return (
        <main >
            <section>
                <div className="container py-7 md:py-16 max-w-5xl">
                    <h1 className='text-center text-2xl font-heading font-bold text-black'>Create a Listing</h1>
                    <div className="mt-8 form_container">
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
                            <div className='feilds_container grid gap-5 md:gap-10  grid-col-1 md:grid-cols-2 items-start  '>



                                {/* ====== Form Sections Start Form Here ===== */}
                                <div className="info_container">
                                    <div className="input_feilds">

                                        <input
                                            id='title'
                                            type="text"
                                            placeholder='Property name' name='title' className='form_input border-[1px]  focus:border-brand-blue rounded-md placeholder:text-sm '
                                            min={10} max={50}
                                            {...register('title', { required: 'This feild is required*' })}
                                        />
                                        {errors.title && <p className='text-red-700 text-xs'>{errors.title.message}</p>}

                                        <textarea
                                            id='description'
                                            type="text"
                                            placeholder='Description'
                                            name='description'
                                            className='form_input border-[1px]  focus:border-brand-blue rounded-md placeholder:text-sm mt-3'
                                            {...register('description', { required: 'This feild is required*' })}
                                        />
                                        {errors.description && <p className='text-red-700 text-xs'>{errors.description.message}</p>}

                                        <input
                                            id='address'
                                            type="text"
                                            placeholder='Address'
                                            name='address'

                                            className='form_input border-[1px]  focus:border-brand-blue rounded-md placeholder:text-sm mt-3'
                                            {...register('address', { required: 'This feild is required*' })}
                                        />
                                        {errors.address && <p className='text-red-700 text-xs font-semibold'>{errors.address.message}</p>}
                                    </div>


                                    <div className="additional_info mt-6 max-w-xs">

                                        <div className="property_type">
                                            <p className='font-heading text-black'>Select property type</p>
                                            <div className="form-control mt-2">
                                                <label className="label cursor-pointer flex items-center justify-start gap-2
                                            ">
                                                    <input
                                                        type="radio"
                                                        name="sale"
                                                        id='sale'
                                                        required
                                                        value={'sale'}
                                                        className="radio w-5 h-5  checked:bg-brand-blue"
                                                        {...register('type')}
                                                    />

                                                    <span className="label-text font-medium">For Sale</span>
                                                </label>
                                            </div>
                                            <div className="form-control ">
                                                <label className="label cursor-pointer flex items-center justify-start gap-2
                                            ">
                                                    <input
                                                        type="radio"
                                                        name="rent"
                                                        id='rent'
                                                        value={'rent'}
                                                        required
                                                        className="radio w-5 h-5 checked:bg-brand-blue"
                                                        {...register('type')}
                                                    />
                                                    <span className="label-text font-medium">For Rent</span>
                                                </label>
                                            </div>
                                        </div>


                                        <div className="property_info mt-3">
                                            <p className='font-heading text-black'>Genarel Information</p>
                                            <div className="max-w-[200px] flex items-center justify-between gap-2 mt-2">
                                                <span className='label-text font-medium'>Area <small>(sqft)</small></span>
                                                <div>
                                                    <input
                                                        defaultValue={550}
                                                        className='border-2 focus:border-brand-blue rounded-md max-w-[84px] py-1 px-2 bg-transparent'
                                                        type="number"
                                                        name="area"
                                                        id="area"
                                                        {...register('area', { required: 'required' })}
                                                    />
                                                    {errors.area && <p className='text-red-700 text-xs font-semibold'>{errors.area.message}</p>}
                                                </div>

                                            </div>


                                            <div className="max-w-[200px]  flex items-center justify-between gap-2 mt-2">
                                                <span className='label-text font-medium'>Bedrooms</span>
                                                <div>
                                                    <input
                                                        defaultValue={1}
                                                        className='border-2 focus:border-brand-blue rounded-md max-w-[84px] min-w-[84px]  py-1 px-2 bg-transparent'
                                                        min={1} max={10}
                                                        type="number"
                                                        name="beds"
                                                        id="bed"
                                                        {...register('bed', { required: 'required' })}
                                                    />
                                                    {errors.bed && <p className='text-red-700 text-xs font-semibold'>{errors.bed.message}</p>}
                                                </div>

                                            </div>
                                            <div className="max-w-[200px] flex items-center justify-between gap-2 mt-1">
                                                <span className='label-text font-medium'>Bathrooms</span>
                                                <div>
                                                    <input
                                                        defaultValue={1}
                                                        className='border-2 focus:border-brand-blue rounded-md max-w-[84px] min-w-[84px] py-1 px-2 bg-transparent'
                                                        min={1} max={10}
                                                        type="number"
                                                        name="beds"
                                                        id="bath"
                                                        {...register('bath', { required: 'required' })}
                                                    />
                                                    {errors.bath && <p className='text-red-700 text-xs font-semibold'>{errors.bath.message}</p>}
                                                </div>
                                            </div>

                                            <div className="max-w-[200px] mt-1">
                                                <label htmlFor="living" className="block text-sm font-medium text-gray-700 mb-1">Living Rooms</label>
                                                <input
                                                    defaultValue={1}
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    min={1}
                                                    max={10}
                                                    type="number"
                                                    name="living"
                                                    id="living"
                                                    {...register('living', { required: 'This field is required*' })}
                                                />
                                                {errors.living && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.living.message}</p>}
                                            </div>


                                            <div className="max-w-[200px] mt-2">
                                                <label htmlFor="BHK" className="block text-sm font-medium text-gray-700 mb-1">Total BHK</label>
                                                <input
                                                    defaultValue={1}
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    min={1}
                                                    max={10}
                                                    type="number"
                                                    name="BHK"
                                                    id="BHK"
                                                    {...register('BHK', { required: 'This field is required*' })}
                                                />
                                                {errors.No_of_Flat && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.No_of_Flat.message}</p>}
                                            </div>


                                            <div className="max-w-[200px] mt-2">
                                                <label htmlFor="builtyear" className="block text-sm font-medium text-gray-700 mb-1">Built year</label>
                                                <input
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    defaultValue={2060}
                                                    type="number"
                                                    name="builtyear"
                                                    id="builtyear"
                                                    {...register('builtyear', { required: 'This field is required*' })}
                                                />
                                                {errors.builtyear && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.builtyear.message}</p>}
                                            </div>


                                            <div className="max-w-[200px] mt-2">
                                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Select Your area</label>
                                                <select
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    name="Yourarea"
                                                    id="Yourarea"
                                                    {...register('Yourarea', { required: 'This field is required*' })}
                                                >
                                                    <option value="" disabled>Select location</option>
                                                    <option value="lakeside">Lakeside</option>
                                                    <option value="pokhara-bazar">Pokhara Bazar</option>
                                                    <option value="baglung">Baglung</option>
                                                    <option value="bindhabasini">Bindhabasini</option>
                                                    <option value="chhorepatan">Chhorepatan</option>
                                                    <option value="damside">Damside</option>
                                                    <option value="patan">Patan</option>
                                                    <option value="prithvi-nagar">Prithvi Nagar</option>
                                                    <option value="rampur">Rampur</option>
                                                    <option value="sarangkot">Sarangkot</option>
                                                    <option value="tal-barahi">Tal Barahi</option>
                                                    <option value="tashi">Tashi</option>
                                                    <option value="thamel">Thamel</option>
                                                    <option value="tonk">Tonk</option>
                                                    <option value="ward-no-1">Ward No 1</option>
                                                    <option value="ward-no-2">Ward No 2</option>
                                                </select>
                                                {errors.location && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.location.message}</p>}
                                            </div>

                                            <div className="max-w-[200px] mt-1">
                                                <label htmlFor="parking" className="block text-sm font-medium text-gray-700 mb-1">Parking (number of cars or if bike then it will be 1)</label>
                                                <input
                                                    defaultValue={0}
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    min={0} max={10}
                                                    type="number"
                                                    name="parking"
                                                    id="parking"
                                                    {...register('parking', { required: 'This field is required*' })}
                                                />
                                                {errors.parking && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.parking.message}</p>}
                                            </div>
                                        </div>


                                        <div className="additional_feature mt-3">
                                            <p className='font-heading text-black'>Additional Information</p>
                                            <div className="max-w-[200px] mt-1">
                                                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">Overall condition (1 = worst, 5 = good, 10 = excellent)</label>
                                                <input
                                                    defaultValue={1}
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm p-2 w-full'
                                                    min={1} max={10}
                                                    type="number"
                                                    name="condition"
                                                    id="condition"
                                                    {...register('condition', { required: 'This field is required*' })}
                                                />
                                                {errors.condition && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.condition.message}</p>}
                                            </div>
                                            <div className="max-w-[200px] mt-2">
                                                <label htmlFor="housetype" className="block text-sm font-medium text-gray-700 mb-1">House Type</label>
                                                <select
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white py-1 px-2 w-full'
                                                    name="housetype"
                                                    id="housetype"
                                                    {...register('housetype', { required: 'Required' })}>
                                                    <option value="" disabled>Select type</option>
                                                    <option value="1">Apartment</option>
                                                    <option value="2">Villa</option>
                                                    <option value="3">House</option>
                                                    <option value="4">Townhouse</option>
                                                    <option value="5">Studio</option>
                                                </select>
                                                {errors.housetype && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.housetype.message}</p>}
                                            </div>

                                            <div className="max-w-[200px] mt-2">
                                                <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                                                <select
                                                    className='border-[1px] border-gray-300 focus:border-brand-blue rounded-md bg-white placeholder:text-sm py-1 px-2 w-full'
                                                    name="direction"
                                                    id="direction"
                                                    {...register('direction', { required: 'This field is required*' })}
                                                >
                                                    <option value="" disabled>Select direction</option>
                                                    <option value="east">East</option>
                                                    <option value="west">West</option>
                                                    <option value="north">North</option>
                                                    <option value="south">South</option>
                                                </select>
                                                {errors.direction && <p className='text-red-700 text-xs font-semibold mt-1'>{errors.direction.message}</p>}
                                            </div>
                                            <div className="form-control">

                                                <label className="label cursor-pointer flex items-center justify-start gap-2">
                                                    <input
                                                        id='furnished'
                                                        type="checkbox"
                                                        className="checkbox w-5 h-5 border-gray-400 rounded-full checked:bg-brand-blue"
                                                        {...register('furnished')}
                                                    />
                                                    <span className="label-text font-medium" >Furnished</span>
                                                </label>

                                                <label className="label cursor-pointer flex items-center justify-start gap-2">
                                                    <input
                                                        id='offer'
                                                        type="checkbox"
                                                        className="checkbox w-5 h-5 border-gray-400 rounded-full checked:bg-brand-blue"
                                                        {...register('offer')}
                                                        onChange={() => setIsoffer(!isOffer)}
                                                    />
                                                    <span className="label-text font-medium" >Do you have any discount?</span>
                                                </label>
                                            </div>
                                        </div>


                                        <div className=" mt-1">
                                            <div className="pricing_info flex flex-col">
                                                <p className="mt-3  font-heading text-black">Regular Price </p>
                                                <span className='text-sm font-content font-bold text-red-900'>($ /month)</span>
                                                <div className="flex flex-row mt-2 ">
                                                    <span className="flex items-center bg-grey-lighter rounded rounded-r-none px-2 font-bold text-grey-darker text-xl">$</span>
                                                    <input
                                                        id='price'
                                                        type="number"
                                                        name="price"
                                                        className="bg-slate-100 p-2 rounded-md text-grey-darkest border-2 focus:border-brand-blue font-bold text-red-700 text-lg max-w-[200px]"
                                                        {...register('price', { required: 'This feild is required*' })}
                                                    />

                                                </div>
                                                {errors.price && <p className='text-red-700 text-xs font-semibold'>{errors.price.message}</p>}
                                            </div>
                                            {
                                                isOffer &&
                                                <div className="pricing_info flex flex-col">
                                                    <p className="mt-3  font-heading text-black">Discount Price </p>
                                                    <span className='text-sm font-content font-bold text-red-900'>($ /month)</span>
                                                    <div className="flex flex-row mt-2 ">
                                                        <span className="flex items-center bg-grey-lighter rounded rounded-r-none px-2 font-bold text-grey-darker text-xl">$</span>
                                                        <input
                                                            id='discountPrice'
                                                            type="number"
                                                            name="discountPrice"
                                                            className="bg-slate-100 p-2 rounded-md text-grey-darkest border-2 focus:border-brand-blue font-bold text-red-700 text-lg max-w-[200px]"
                                                            {...register('discountPrice', {
                                                                required: 'This feild is required*',
                                                                validate: (value) => {
                                                                    const { price } = getValues();
                                                                    if (+price < +value) {
                                                                        return '*Discount price should be lower than regular price'
                                                                    }
                                                                }
                                                            })}
                                                        />

                                                    </div>
                                                    {errors.discountPrice && <p className='text-red-700 text-xs font-semibold'>{errors.discountPrice.message}</p>}
                                                </div>
                                            }
                                        </div>

                                    </div>
                                </div>



                                {/* === Image Uploading Section Start Here === */}
                                <div>

                                    <div> <MapComponent onLocationSelect={handleLocationSelect} /></div>

                                    <p className='font-content text-[16px] mb-3 font-normal text-black'>
                                        <span className='font-semibold mr-1'>Note:</span>
                                        First image will be cover image (max:6)
                                    </p>
                                    <div className="image_upload_container md:p-5 md:border-2 bg-transparent border-dashed rounded-sm md:flex items-center justify-center gap-2">

                                        <input
                                            onChange={(e) => setImageFile(e.target.files)}
                                            required
                                            multiple accept='image/*' type="file"
                                            className={`file-input file:bg-brand-blue bg-red-00 ${loading ? "md:w-4/6" : 'md:w-4/5'} w-full`} />
                                        <button
                                            disabled={loading || imageFile.length === 0}
                                            onClick={handleImageUpload}
                                            type='button' className={`w-full text-green-600 text-sm py-2 border-2 border-green-600 rounded-md mt-2 uppercase font-heading  ${loading ? "md:w-2/6" : 'md:w-1/5'} md:h-[3rem] md:mt-0 duration-500 hover:shadow-lg disabled:border-gray-500 disabled:text-gray-500`}>
                                            {
                                                loading ? 'Uploading...' : 'Upload'
                                            }
                                        </button>
                                    </div>



                                    <div>
                                        {
                                            formData.imgUrl.length > 0 && formData.imgUrl.map((imgSrc, index) => {
                                                return (
                                                    <div key={index} className="uploaded_images p-2 pr-5 border-2 mt-4  rounded-md flex items-center justify-between">
                                                        <img src={imgSrc} alt="property Image" className='w-24 h-20 object-cover rounded-md' />
                                                        <button
                                                            onClick={() => handleDelete(index)}
                                                            type='button'
                                                            className='font-medium text-lg text-red-700 flex items-center underline hover:opacity-75'>Delete</button>
                                                    </div>
                                                )
                                            })
                                        }

                                        <div className="post_btn mt-7">
                                            <button
                                                type='button'
                                                onClick={handlePredict}
                                                className="w-full bg-green-500 text-xl tracking-wider font-heading rounded-md hover:opacity-90 duration-300 text-white p-3">
                                                Predict Price
                                            </button>
                                        </div>


                                        <div className="post_btn mt-7">
                                            <button

                                                disabled={formData.imgUrl.length < 1 || loading || formSubmitLoading}
                                                type='submit'
                                                className="w-full bg-brand-blue text-xl tracking-wider font-heading rounded-md hover:opacity-90 disabled:opacity-70 duration-300 text-white p-3">
                                                {
                                                    formSubmitLoading ? 'Creating...' : 'Create Post'
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                        {prediction !== null && (
                            <div>
                                <h2>Predicted Price: NPR {prediction.toFixed(2)}</h2>
                            </div>
                        )}
                    </div>
                </div>
                <ToastContainer />
            </section>
        </main>
    )
}

export default CreatePost