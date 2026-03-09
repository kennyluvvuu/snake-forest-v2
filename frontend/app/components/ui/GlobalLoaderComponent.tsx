import { useEffect } from "react";
import { useNavigation } from "react-router";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

nprogress.configure({ showSpinner: false, speed: 500, trickleSpeed: 200 });

export default function GlobalLoaderComponent() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  useEffect(() => {
    if (isLoading) {
      nprogress.start();
    } else {
      nprogress.done();
    }
  }, [isLoading]);

  return null;
}
