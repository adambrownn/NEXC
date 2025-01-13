import { Button, Container, TextField, Typography } from "@material-ui/core";
import React, { useState, useEffect, createContext, useContext } from "react";
import { experimentalStyled as styled } from "@material-ui/core/styles";
import { HashLink as HLink } from "react-router-hash-link";

import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow,
} from "react-google-maps";
import axiosInstance from "../../../axiosConfig";

const ContentStyle = styled("div")(({ theme }) => ({
  marginBlock: 2,
  borderRadius: theme.shape.borderRadiusMd,
  [theme.breakpoints.up("md")]: {
    display: "flex",
    maxWidth: "100%",
    paddingBottom: 0,
    alignItems: "center",
  },
}));

const MapMarkerContext = createContext();

const MapWithAMarker = withScriptjs(
  withGoogleMap((props) => {
    const { markerZoom } = useContext(MapMarkerContext);

    return (
      <GoogleMap zoom={markerZoom} defaultZoom={6} center={props.center}>
        {props.postcode &&
          props.markers.map(
            ({ id, isIconCustomized, positions, info = null }) => (
              <Marker
                key={id}
                icon={
                  isIconCustomized
                    ? "https://img.icons8.com/ios-glyphs/30/000000/user-location.png"
                    : null
                }
                position={positions}
                onClick={
                  info
                    ? () => {
                        props.handler.onMarkerClick(id);
                      }
                    : null
                }
              >
                {info && props.selectedCenter === id && (
                  <InfoWindow
                    onCloseClick={props.handler.onMarkerCloseClick}
                    position={positions}
                  >
                    <div className="markerInfoWrapper">
                      <b>{info.name}</b>
                      <p>{info.address}</p>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            )
          )}
      </GoogleMap>
    );
  })
);

function LandingMap(props) {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 55.1041204,
    lng: -2.8518416,
  });
  const [markers, setMarkers] = useState([]);
  const [markerZoom, setMarkerZoom] = useState(6);
  const [zipCode, setZipcode] = useState();
  const [postCode, setPostCode] = useState("");

  const getMarkers = async (center) => {
    setMarkers((oldMarks) => [
      ...oldMarks,
      {
        id: center._id,
        isIconCustomized: false,
        positions: {
          lat: Number(center?.geoLocation?.coordinates[0]),
          lng: Number(center?.geoLocation?.coordinates[1]),
        },
        info: {
          name: center.title,
          address: center.address,
        },
      },
    ]);
  };

  useEffect(() => {
    (async () => {
      const resp = await axiosInstance.get("/centers");
      if (resp.data?.length) {
        resp.data?.map(async (center) => {
          return getMarkers(center);
        });
      }
    })();
  }, []);

  const enterPressed = (event) => {
    var code = event.keyCode || event.which;
    if (code === 13) {
      // CV37 6RP
      //13 is the enter keycode
      let postcode = event?.target?.value || zipCode;
      setPostCode(postcode);
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=postalcode+${postcode}&key=AIzaSyBUo7uu6XaDXn2G_yoxA7t4wdbZgOsyANc`
      )
        .then((data) => data.json())
        .then((data) => {
          setMarkerZoom(12);
          const { geometry, place_id } = data?.results[0] || {};
          setMapCenter(geometry?.location);
          let filteresMarkers = [];
          let lastMarker = markers[markers.length - 1];
          if (lastMarker?.isIconCustomized) {
            filteresMarkers = markers.filter(
              (each) => each?.id !== lastMarker?.id
            );
          } else {
            filteresMarkers = [...markers];
          }
          setMarkers([
            ...filteresMarkers,
            {
              id: place_id,
              isIconCustomized: true,
              positions: geometry?.location,
            },
          ]);
        });
    }
  };

  const onMarkerClick = (markerid) => {
    setSelectedCenter(markerid);
  };
  const onMarkerCloseClick = () => {
    setSelectedCenter(null);
  };
  useEffect(() => {
    const listener = (e) => {
      if (e.key === "Escape") {
        setSelectedCenter(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
  return (
    <Container
      style={{
        marginBlock: 33,
      }}
      maxWidth="lg"
    >
      <Typography variant="h3" sx={{ textAlign: "center" }}>
        Find your closest Test center
      </Typography>
      <ContentStyle>
        <TextField
          style={{
            backgroundColor: "#ffecc9",
            marginRight: 10,
            width: "100%",
          }}
          fullWidth
          color="secondary"
          type="text"
          label="Enter your Postcode"
          onChange={(e) => setZipcode(e.target.value)}
          onKeyPress={enterPressed}
        />
        <Button
          variant="contained"
          size="large"
          fullWidth
          style={{ marginTop: 10 }}
          onClick={() =>
            enterPressed({
              keyCode: 13,
            })
          }
        >
          FIND CENTER
        </Button>
      </ContentStyle>
      <div style={{ height: "auto", width: "100%", borderRadius: "20px" }}>
        <MapMarkerContext.Provider value={{ markerZoom }}>
          <MapWithAMarker
            googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBUo7uu6XaDXn2G_yoxA7t4wdbZgOsyANc&v=3.exp&libraries=geometry,drawing,places"
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `600px` }} />}
            mapElement={<div style={{ height: `100%` }} />}
            markers={markers}
            postcode={postCode}
            center={mapCenter}
            selectedCenter={selectedCenter}
            handler={{ onMarkerClick, onMarkerCloseClick }}
          />
        </MapMarkerContext.Provider>
      </div>
      <br />
      <Typography sx={{ textAlign: "center" }}>
        <HLink to={"/trades#csl-tests"}>
          <Button variant="contained" size="large">
            Book your Test
          </Button>
        </HLink>
      </Typography>
    </Container>
  );
}

export default LandingMap;
