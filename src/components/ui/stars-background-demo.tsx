"use client";
import React, { useState } from "react";
import { StarsBackground } from "./stars-background";
import { motion } from "framer-motion";
import { Card, CardContent } from "./card";
import { Label } from "./label";
import { Slider } from "./slider";
import { Checkbox } from "./checkbox";

export function StarsBackgroundDemo() {
  const [settings, setSettings] = useState({
    density: 0.00015,
    allTwinkle: true,
    twinkleProbability: 0.7,
    minSpeed: 0.5,
    maxSpeed: 1,
  });

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <StarsBackground
        starDensity={settings.density}
        allStarsTwinkle={settings.allTwinkle}
        twinkleProbability={settings.twinkleProbability}
        minTwinkleSpeed={settings.minSpeed}
        maxTwinkleSpeed={settings.maxSpeed}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-theme-accent to-theme-accent-dark">
            Dynamic Stars Background
          </h1>
          <p className="text-lg md:text-xl text-theme-text-secondary max-w-2xl mx-auto mb-12">
            A customizable canvas-based starry night effect with twinkling stars
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-[500px] min-w-[400px]"
        >
          <Card className="bg-theme-bg/80 backdrop-blur-md border-theme-border/40">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-theme-text-primary">
                    Star Density: {settings.density.toFixed(5)}
                  </Label>
                  <Slider
                    value={[settings.density]}
                    min={0.00005}
                    max={0.0003}
                    step={0.00001}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, density: value }))
                    }
                    className="my-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-theme-text-primary">
                    Min Twinkle Speed: {settings.minSpeed.toFixed(1)}
                  </Label>
                  <Slider
                    value={[settings.minSpeed]}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, minSpeed: value }))
                    }
                    className="my-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-theme-text-primary">
                    Max Twinkle Speed: {settings.maxSpeed.toFixed(1)}
                  </Label>
                  <Slider
                    value={[settings.maxSpeed]}
                    min={0.1}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      setSettings((prev) => ({ ...prev, maxSpeed: value }))
                    }
                    className="my-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allTwinkle"
                    checked={settings.allTwinkle}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        allTwinkle: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="allTwinkle" className="text-theme-text-primary">
                    All Stars Twinkle
                  </Label>
                </div>

                {!settings.allTwinkle && (
                  <div className="space-y-2">
                    <Label className="text-theme-text-primary">
                      Twinkle Probability: {settings.twinkleProbability.toFixed(2)}
                    </Label>
                    <Slider
                      value={[settings.twinkleProbability]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={([value]) =>
                        setSettings((prev) => ({
                          ...prev,
                          twinkleProbability: value,
                        }))
                      }
                      className="my-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}