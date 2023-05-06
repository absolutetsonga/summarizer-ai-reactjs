import {useEffect, useState} from "react";
import {copy, linkIcon, loader, tick} from "../assets/index.js"
import {useLazyGetSummaryQuery} from "../store/article.js";

export const Demo = () => {
    let content;
    
    const [getSummary, { error, isError, isFetching }] = useLazyGetSummaryQuery();
    
    const [article, setArticle] = useState({url: '', summary: ''});
    const [allArticles, setAllArticles] = useState([]);
    
    const [copiedLink, setCopiedLink] = useState("");
    const [copiedText, setCopiedText] = useState("");
    
    useEffect(() => {
        const articlesFromLocalStorage = JSON.parse(localStorage.getItem("articles"));
        
        if (articlesFromLocalStorage) setAllArticles(articlesFromLocalStorage);
    }, [])
    
    const handleCopyLink = (copyURL) => {
        setCopiedLink(copyURL);
        
        navigator.clipboard.writeText(copyURL);
        
        setTimeout(() => setCopiedLink(''), 3000);
    }
    
    const handleCopyText = (summary) => {
        setCopiedText(summary);
        
        navigator.clipboard.writeText(summary);
        
        setTimeout(() => setCopiedText(''), 3000);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const {data} = await getSummary({articleUrl: article.url})
        
        if (data?.summary) {
            const newArticle = { ...article, summary: data.summary };
            
            setArticle(newArticle);
            setAllArticles([...allArticles, newArticle]);
            
            localStorage.setItem("articles", JSON.stringify([...allArticles, newArticle]));
        }
    }
    
    {
        isFetching
            ? content =
                (<div className="flex flex-col items-center text-center font-bold blue_gradient">
                    <img src={loader} alt="loader" className="w-20 h-20 object-contain"/>
                    <h5> Just wait a little bit... It should take less than a minute </h5>
                </div>)
            : isError
                ? content =
                    (<p className="font-bold text-black text-center">
                    Oops, {error}. Please try again later...
                    <br />
                    <span className="text-gray-700">
                        {error?.data?.error}
                    </span>
                </p>)
                : content = (article.summary &&
                    <div className="flex flex-col gap-3 blue_gradient">
                        <h2 className="font-bold text-gray-600 text-xl">
                            Article <span className="blue_gradient">Summary</span>
                        </h2>
                        <div className="flex gap-2 summary_box text-black text-sm font-normal">
                            <p className="w-11/12">{article?.summary}</p>
                            <div className="copy_btn w-1/12" onClick={() => handleCopyText(article.summary)}>
                                <img
                                    src={copiedText === article.summary ? tick : copy}
                                    alt={copiedText === article.summary ? 'copiedLink_icon' : 'copy_icon'}
                                    className="w-10 h-10 object-contain"
                                />
                            </div>
                        </div>
                    </div>)
    }
    
    return (
        <section className="mt-16 w-full max-w-xl">
            <div className="flex flex-col w-full gap-2 relative">
                <form className="relative flex justify-center items-center" onSubmit={handleSubmit}>
                    <img src={linkIcon} alt="link_icon" className="absolute left-0 my-2 ml-3 w-5"/>
                    <input value={article.url} type="url" placeholder="Enter a URL" onChange={(e) => setArticle({...article, url: e.target.value})} required className="url_input peer"/>
                    <button type="submit" className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700">↵</button>
                </form>
                <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {
                        allArticles.map((article, index) => {
                            return (
                                <button
                                    key={`link-${index}`}
                                    onClick={() => setArticle(article)}
                                    className="link_card"
                                >
                                    <div className="copy_btn" onClick={() => handleCopyLink(article.url)}>
                                        <img
                                            src={copiedLink === article.url ? tick : copy}
                                            alt={copiedLink === article.url ? 'copiedLink_icon' : 'copy_icon'}
                                            className="w-[40% h-[40%] object-contain]"
                                        />
                                    </div>
                                    <p className="flex-1 text-blue-700 font-medium truncate">{article.url}</p>
                                </button>
                                
                            )
                        })
                    }
                </div>
                <div className="my-10 max-w-full flex justify-center items-center">
                    {content}
                </div>
            </div>
        </section>
    )
}