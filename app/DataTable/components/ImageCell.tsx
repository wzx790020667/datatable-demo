import { faImage } from "@fortawesome/free-solid-svg-icons"
import { Image } from "@nextui-org/react"
import { useState } from "react"

interface ImageCellProps {
    url?: string | null
    mode: "editing" | "preview"
}

export function ImageCell({
    url,
    mode
}: ImageCellProps) {
    const [selectedImage, setSelectedImage] = useState()

    const onImageSelected = () => {
    }

    // return mode === 'preview' ?
    //     <div>
    //         {url ? <Image src={url} alt="Image" className="w-full" width={100} height={50} /> :
    //             <div className="flex flex-row items-center">
    //                 <FontAwesomeIcon className="mr-2" icon={faImage} />
    //                 No image provided
    //             </div>
    //         }
    //     </div> :
    //     <input type="file"
    //         accept="png"
    //         className="block
    //             cursor-pointer text-white
    //             rounded-sm
    //             placeholder-red-700
    //             bg-blue-500
    //             outline-none
    //             w-full
    //             text-sm max-w-52"
    //     />
    return <Image src={url ?? ''} alt="Image" className="w-full" width={100} height={50} />
}