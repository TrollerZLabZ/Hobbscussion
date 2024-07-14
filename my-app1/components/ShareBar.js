import {
    FacebookShareButton,
    RedditShareButton,
    TelegramShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    RedditIcon,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    WhatsappIcon

} from "react-share";

const ShareBar = ({ post }) => {
    const shareUrl = window.location.href; // Or any specific URL you want to share
    const title = post.title; // Assuming 'post' is the post object

    return (
        <div className="flex items-center space-x-2">
            <FacebookShareButton url={shareUrl} quote={title}>
                <FacebookIcon size={32} round />
            </FacebookShareButton>
            <TwitterShareButton url={shareUrl} title={title}>
                <TwitterIcon size={32} round />
            </TwitterShareButton>
            <RedditShareButton url={shareUrl} title={title}>
                <RedditIcon size={32} round />
            </RedditShareButton>
            {/* Telegram */}
            <TelegramShareButton url={shareUrl} title={title}>
                <TelegramIcon size={32} round />
            </TelegramShareButton>
            {/* WhatsApp */}
            <WhatsappShareButton url={shareUrl} title={title}>
                <WhatsappIcon size={32} round />
            </WhatsappShareButton>
        </div>
    );
};
export default ShareBar;