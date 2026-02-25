import React from "react";
import Bounded from "../Bounded/Bounded";

const CTAsection = () => {
  return (
    <div>
      <Bounded className="py-[100px] ">
        <div className="relative bg-[linear-gradient(96deg,#FEF8F0_3.47%,#FFDFC3_100%)] p-[100px] rounded-[32px]  space-y-[32px] overflow-hidden">
          <div className="space-y-[24px]">
            <h2 className="text-primary text-center font-archivo text-[60px] leading-[70px] font-semibold">
              Still Need Help?
            </h2>
            <p className="max-w-[640px] mx-auto text-center text-primary-300 font-inter text-[16px] leading-[26px] font-normal">
              Our dedicated support team is ready to provide you with the
              assistance you need. Don&apos;t hesitate to reach out.
            </p>
          </div>
          <div className="flex items-center justify-center gap-[32px]">
            <button className="flex items-center gap-[10px] bg-secondary text-primary py-[14px] px-[24px] text-[18px] leading-[28px] font-archivo font-normal rounded-[32px]">
              <span>Send a Message</span>
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M0.999348 0.999999L12.666 12.6667M12.666 12.6667L12.666 1M12.666 12.6667L0.999348 12.6667"
                    stroke="#0E1A40"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </button>
            <button className="text-primary text-[18px] leading-[28px] bg-white border border-secondary py-[14px] px-[24px] rounded-[32px]">
              Call Us Directly
            </button>
          </div>
          <div className="absolute right-0 bottom-0">
        <svg
          width="296"
          height="280"
          viewBox="0 0 296 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.2">
            <path
              d="M65.973 329.342C63.993 319.824 65.2098 311.458 66.1962 302.184L123.818 221.083L222.371 82.5912C222.847 81.9216 224.467 81.8136 224.236 80.352L76.449 80.208C76.557 79.9416 76.413 79.5744 76.413 79.2864L76.3842 29.9736L154.994 29.9592L288.439 30.096C287.776 27 285.004 26.6616 282.11 26.6616L163.497 26.676H75.2898C74.5914 26.676 73.893 26.7984 73.1874 26.7696C72.8274 26.64 72.1146 27.144 72.1146 27.9216L72.2658 84.4704L215.992 84.5928C215.963 85.968 215.927 86.4936 215.891 86.6448L120.383 221.026L62.157 302.35L61.7754 333.331L236.836 333.346C239.5 333.346 241.487 332.021 241.041 329.35H65.973V329.342ZM100.072 81.0144C98.805 81.108 97.545 81.216 96.285 81.3744C97.4586 80.9712 98.7402 80.9136 100.072 81.0144Z"
              fill="#A6794B"
            />
            <path
              d="M143.791 154.915L177.098 107.676C178.87 105.25 179.093 100.015 176.947 97.2649L121.32 97.9489C118.75 97.9489 117.828 97.8841 114.048 97.9201L68.8105 98.0497C70.1641 100.807 72.4825 101.743 74.1961 103.334C74.9953 104.076 75.7657 105.394 77.5225 105.401L122.573 105.711L167.486 106.762L140.501 146.47L78.5881 234.446L49.5289 275.94C49.4641 280.44 48.9097 284.803 49.8097 289.829L89.8777 232.466L143.791 154.901V154.915Z"
              fill="#A6794B"
            />
            <path
              d="M209.742 247.291C208.259 249.401 206.171 255.146 208.885 256.493L287.545 256.745C285.177 254.066 282.585 252.475 279.64 250.402L215.639 250.034L247.233 203.213L310.701 111.607C307.763 111.744 303.645 112.255 301.305 114.214L244.396 198.007L209.749 247.284L209.742 247.291Z"
              fill="#A6794B"
            />
            <path
              d="M173.766 264.456L239.17 172.75L290.946 100.469C288.426 101.016 285.582 102.247 284.091 104.335L237.154 170.892L171.922 261.778C169.964 264.506 167.689 266.832 166.018 270.533C165.169 272.419 161.914 273.506 161.454 276.631C159.488 277.121 160.021 278.95 162.181 278.798L295.626 278.784C298.03 278.784 299.809 276.862 299.701 275.393L167.329 275.371C169.719 270.907 171.375 267.818 173.773 264.456H173.766Z"
              fill="#A6794B"
            />
          </g>
        </svg>
          </div>
        </div>
      </Bounded>
    </div>
  );
};

export default CTAsection;
