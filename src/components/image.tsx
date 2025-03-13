"use client";

import React from "react";
import { IKImage } from "imagekitio-next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL;

const Image = (props: any) => {
  return <IKImage urlEndpoint={urlEndpoint} {...props} />;
};

export default Image;
