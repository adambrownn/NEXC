import PropTypes from "prop-types";
import { Icon } from "@iconify/react";
import eyeFill from "@iconify/icons-eva/eye-fill";
import { Link as RouterLink } from "react-router-dom";
import shareFill from "@iconify/icons-eva/share-fill";
import clockFill from "@iconify/icons-eva/clock-fill";
// material
import { styled } from "@mui/material/styles";
import {
  Box,
  Link,
  Card,
  Grid,
  Avatar,
  Typography,
  CardContent,
  Chip,
  Stack,
} from "@mui/material";
// utils
import { fDate } from "../../../utils/formatTime";
import { fShortenNumber } from "../../../utils/formatNumber";
//
import SvgIconStyle from "../../SvgIconStyle";

// ----------------------------------------------------------------------

const CardMediaStyle = styled("div")({
  position: "relative",
  paddingTop: "calc(100% * 3 / 4)",
});

const TitleStyle = styled(Link)({
  height: 44,
  overflow: "hidden",
  WebkitLineClamp: 2,
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
});

const AvatarStyle = styled(Avatar)(({ theme }) => ({
  zIndex: 9,
  width: 32,
  height: 32,
  position: "absolute",
  left: theme.spacing(3),
  bottom: theme.spacing(-2),
}));

const InfoStyle = styled("div")(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  marginTop: theme.spacing(3),
  color: theme.palette.text.disabled,
}));

const CoverImgStyle = styled("img")({
  top: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
});

// ----------------------------------------------------------------------

BlogPostCard.propTypes = {
  post: PropTypes.object.isRequired,
  index: PropTypes.number,
};

export default function BlogPostCard({ post, index }) {
  const {
    title = '',
    excerpt = '',
    coverImage = '',
    author = {
      name: '',
      avatarUrl: '/static/mock-images/avatars/avatar_default.jpg'
    },
    createdAt = new Date().toISOString(),
    status = 'draft',
    metadata = { 
      views: 0, 
      shares: 0, 
      readTime: 0 
    },
    categories = [],
    _id: id = ''
  } = post || {};

  const latestPostLarge = index === 0;
  const latestPost = index === 1 || index === 2;

  const POST_INFO = [
    { number: metadata?.views || 0, icon: eyeFill },
    { number: metadata?.shares || 0, icon: shareFill },
    { number: metadata?.readTime || 0, icon: clockFill, suffix: " min read" },
  ];

  return (
    <Grid item xs={12} sm={latestPostLarge ? 12 : 6} md={latestPostLarge ? 6 : 3}>
      <Card sx={{ position: "relative" }}>
        <CardMediaStyle
          sx={{
            ...((latestPostLarge || latestPost) && {
              pt: 0,
              zIndex: 0,
            }),
            ...(latestPostLarge && {
              pt: {
                xs: "calc(100% * 4 / 3)",
                sm: "calc(100% * 3 / 4.66)",
              },
            }),
          }}
        >
          <SvgIconStyle
            src="/static/icons/shape-avatar.svg"
            sx={{
              width: 80,
              height: 36,
              zIndex: 9,
              bottom: -15,
              position: "absolute",
              color: "background.paper",
              ...((latestPostLarge || latestPost) && { display: "none" }),
            }}
          />
          <AvatarStyle
            alt={author.name}
            src={author.avatarUrl}
            sx={{
              ...((latestPostLarge || latestPost) && {
                zIndex: 9,
                top: 24,
                left: 24,
                width: 40,
                height: 40,
              }),
            }}
          />

          <CoverImgStyle alt={title} src={coverImage} />
        </CardMediaStyle>

        <CardContent
          sx={{
            pt: 4,
            ...((latestPostLarge || latestPost) && {
              bottom: 0,
              width: "100%",
              position: "absolute",
            }),
          }}
        >
          <Stack direction="row" spacing={1} mb={1}>
            {categories?.map((category) => (
              <Chip
                key={category}
                label={category}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {status === 'draft' && (
              <Chip
                label="Draft"
                size="small"
                color="warning"
              />
            )}
          </Stack>

          <TitleStyle
            color="inherit"
            variant="subtitle2"
            underline="hover"
            component={RouterLink}
            to={id ? `/dashboard/blog/${id}` : '#'}
            sx={{
              ...(latestPostLarge && { typography: "h5", height: 60 }),
              ...((latestPostLarge || latestPost) && {
                color: "common.white",
              }),
            }}
          >
            {title}
          </TitleStyle>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mt: 1,
              color: "text.disabled",
              ...((latestPostLarge || latestPost) && {
                color: "common.white",
                opacity: 0.72,
              }),
            }}
          >
            <Typography variant="caption">{fDate(createdAt)}</Typography>
            <Typography variant="caption">•</Typography>
            <Typography variant="caption">{excerpt}</Typography>
          </Stack>

          <InfoStyle>
            {POST_INFO.map((info, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: index === 0 ? 0 : 1.5,
                  ...((latestPostLarge || latestPost) && {
                    color: "grey.500",
                  }),
                }}
              >
                <Box
                  component={Icon}
                  icon={info.icon}
                  sx={{ width: 16, height: 16, mr: 0.5 }}
                />
                <Typography variant="caption">
                  {fShortenNumber(info.number)}
                  {info.suffix || ''}
                </Typography>
              </Box>
            ))}
          </InfoStyle>
        </CardContent>
      </Card>
    </Grid>
  );
}
